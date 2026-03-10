import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Lock, Unlock, CheckCircle, Building2,
  MapPin, Loader2, AlertTriangle, ExternalLink, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface CompanyData {
  // Champs verrouillés après sélection (source : annuaire officiel)
  name:        string;   // Raison sociale
  siren:       string;
  siret:       string;   // Siège principal
  nafCode:     string;   // Code NAF/APE
  legalForm:   string;   // Forme juridique
  isActive:    boolean;  // Entreprise active ?

  // Champs libres (modifiables par l'user)
  tvaNumber:   string;   // TVA intracommunautaire (calculée mais éditable)
  address:     string;
  address2:    string;
  city:        string;
  postalCode:  string;
  country:     string;
}

interface ApiEntreprise {
  nom_raison_sociale: string;
  siren: string;
  siege: {
    siret: string;
    code_postal: string;
    libelle_commune: string;
    adresse: string;
    activite_principale: string;
  };
  activite_principale: string;
  nature_juridique: string;
  etat_administratif: string;
  matching_etablissements?: any[];
}

interface AddressSuggestion {
  label:      string;
  address:    string;
  city:       string;
  postalCode: string;
  country:    string;
  lat?:       number;
  lon?:       number;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Calcule le numéro TVA intracommunautaire depuis le SIREN
function computeTvaNumber(siren: string): string {
  if (siren.length !== 9 || !/^\d+$/.test(siren)) return "";
  const key = (12 + 3 * (parseInt(siren) % 97)) % 97;
  return `FR${String(key).padStart(2, "0")}${siren}`;
}

// Traduit le code nature juridique en libellé court
function legalFormLabel(code: string): string {
  const MAP: Record<string, string> = {
    "1000": "Entrepreneur individuel",
    "2110": "SNC", "2120": "SCS",
    "5105": "SA",  "5499": "SARL", "5710": "SAS", "5720": "SASU",
    "6540": "Association loi 1901",
    "9220": "Micro-entrepreneur",
  };
  return MAP[code] || code;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ─── RECHERCHE ENTREPRISE (API Recherche Entreprises — data.gouv.fr) ─────────

async function searchCompanies(query: string): Promise<ApiEntreprise[]> {
  if (query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&limite=6&est_active=true`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

// ─── RECHERCHE ADRESSE ────────────────────────────────────────────────────────

async function searchAddress(query: string, country: string): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return [];

  // France → API BAN (Base Adresse Nationale) — gratuite, officielle
  if (country === "FR") {
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`,
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.features || []).map((f: any) => ({
        label:      f.properties.label,
        address:    f.properties.name,
        city:       f.properties.city,
        postalCode: f.properties.postcode,
        country:    "FR",
        lat:        f.geometry.coordinates[1],
        lon:        f.geometry.coordinates[0],
      }));
    } catch {
      return [];
    }
  }

  // International → Google Maps Places Autocomplete
  // Nécessite VITE_GOOGLE_MAPS_KEY dans .env
  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  if (!GOOGLE_KEY) return [];
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(query)}&types=address&key=${GOOGLE_KEY}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.predictions || []).slice(0, 5).map((p: any) => ({
      label:      p.description,
      address:    p.structured_formatting?.main_text || p.description,
      city:       p.structured_formatting?.secondary_text?.split(",")[0] || "",
      postalCode: "",
      country,
    }));
  } catch {
    return [];
  }
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

interface CompanySearchInputProps {
  value:    Partial<CompanyData>;
  onChange: (data: Partial<CompanyData>) => void;
  label?:   string; // "Votre entreprise" | "Client"
  showAddressSearch?: boolean;
}

export function CompanySearchInput({
  value,
  onChange,
  label = "Entreprise",
  showAddressSearch = true,
}: CompanySearchInputProps) {

  // Recherche entreprise
  const [companyQuery, setCompanyQuery]   = useState("");
  const [companySuggestions, setCompanySuggestions] = useState<ApiEntreprise[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyLocked, setCompanyLocked] = useState(false);
  const [showCompanyList, setShowCompanyList] = useState(false);

  // Recherche adresse
  const [addressQuery, setAddressQuery]   = useState(value.address || "");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);

  // Pays sélectionné (détermine quelle API adresse utiliser)
  const [country, setCountry] = useState(value.country || "FR");

  const debouncedCompany = useDebounce(companyQuery, 350);
  const debouncedAddress = useDebounce(addressQuery, 350);
  const companyRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  // ── Recherche entreprise au changement ──────────────────────────────────
  useEffect(() => {
    if (!debouncedCompany || companyLocked) { setCompanySuggestions([]); return; }
    setCompanyLoading(true);
    searchCompanies(debouncedCompany).then(results => {
      setCompanySuggestions(results);
      setShowCompanyList(results.length > 0);
      setCompanyLoading(false);
    });
  }, [debouncedCompany, companyLocked]);

  // ── Recherche adresse au changement ──────────────────────────────────────
  useEffect(() => {
    if (!debouncedAddress || debouncedAddress.length < 3) { setAddressSuggestions([]); return; }
    setAddressLoading(true);
    searchAddress(debouncedAddress, country).then(results => {
      setAddressSuggestions(results);
      setShowAddressList(results.length > 0);
      setAddressLoading(false);
    });
  }, [debouncedAddress, country]);

  // ── Fermer les listes au clic extérieur ──────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(e.target as Node))
        setShowCompanyList(false);
      if (addressRef.current && !addressRef.current.contains(e.target as Node))
        setShowAddressList(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Sélection d'une entreprise ───────────────────────────────────────────
  const selectCompany = useCallback((company: ApiEntreprise) => {
    const siren      = company.siren;
    const siret      = company.siege?.siret || "";
    const nafCode    = company.siege?.activite_principale || company.activite_principale || "";
    const legalForm  = legalFormLabel(company.nature_juridique || "");
    const tvaNumber  = computeTvaNumber(siren);
    const address    = company.siege?.adresse || "";
    const postalCode = company.siege?.code_postal || "";
    const city       = company.siege?.libelle_commune || "";

    const companyData: Partial<CompanyData> = {
      name:       company.nom_raison_sociale,
      siren,
      siret,
      nafCode,
      legalForm,
      tvaNumber,
      address,
      postalCode,
      city,
      country:    "FR",
      isActive:   company.etat_administratif === "A",
    };

    onChange(companyData);
    setCompanyQuery(company.nom_raison_sociale);
    setAddressQuery(address ? `${address} ${postalCode} ${city}` : "");
    setCountry("FR");
    setCompanyLocked(true);
    setShowCompanyList(false);
  }, [onChange]);

  // ── Déverrouiller ────────────────────────────────────────────────────────
  const unlock = () => {
    setCompanyLocked(false);
    setCompanyQuery("");
    onChange({});
  };

  // ── Sélection d'une adresse ──────────────────────────────────────────────
  const selectAddress = useCallback((suggestion: AddressSuggestion) => {
    onChange({
      ...value,
      address:    suggestion.address,
      city:       suggestion.city,
      postalCode: suggestion.postalCode,
      country:    suggestion.country,
    });
    setAddressQuery(suggestion.label);
    setShowAddressList(false);
  }, [value, onChange]);

  const isLocked = companyLocked && !!value.siren;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Recherche entreprise ─────────────────────────────────────────── */}
      <div ref={companyRef} className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs font-medium">{label}</Label>
          {isLocked && (
            <button onClick={unlock}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors">
              <Unlock className="h-3 w-3" />Modifier
            </button>
          )}
        </div>

        <div className="relative">
          {/* Icône gauche */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {companyLoading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : isLocked
                ? <Lock className="h-4 w-4 text-success" />
                : <Search className="h-4 w-4" />}
          </div>

          <Input
            value={companyQuery}
            onChange={e => { setCompanyQuery(e.target.value); setShowCompanyList(true); }}
            onFocus={() => companySuggestions.length > 0 && setShowCompanyList(true)}
            placeholder="Nom ou SIREN de l'entreprise..."
            className={`pl-9 pr-10 h-10 text-sm transition-colors ${
              isLocked ? "bg-success/5 border-success/40 text-foreground" : ""
            }`}
            disabled={isLocked}
            autoComplete="off"
          />

          {/* Badge vérifié */}
          {isLocked && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
          )}

          {/* Effacer */}
          {companyQuery && !isLocked && (
            <button onClick={() => { setCompanyQuery(""); setCompanySuggestions([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Badge vérifié sous le champ */}
        {isLocked && value.isActive !== false && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 mt-1.5">
            <CheckCircle className="h-3 w-3 text-success" />
            <span className="text-[10px] text-success">
              Vérifié via l'annuaire officiel data.gouv.fr
            </span>
            <a href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${value.siren}`}
              target="_blank" rel="noopener noreferrer"
              className="text-[10px] text-primary hover:underline flex items-center gap-0.5 ml-1">
              <ExternalLink className="h-2.5 w-2.5" />Voir la fiche
            </a>
          </motion.div>
        )}

        {/* Alerte entreprise inactive */}
        {isLocked && value.isActive === false && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 mt-1.5">
            <AlertTriangle className="h-3 w-3 text-warning" />
            <span className="text-[10px] text-warning">
              Cette entreprise est marquée comme inactive dans l'annuaire officiel.
            </span>
          </motion.div>
        )}

        {/* Liste suggestions entreprises */}
        <AnimatePresence>
          {showCompanyList && companySuggestions.length > 0 && !isLocked && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              {companySuggestions.map((company, i) => (
                <button key={company.siren} onClick={() => selectCompany(company)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/40 last:border-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {company.nom_raison_sociale}
                      </span>
                      {company.etat_administratif === "A" ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium flex-shrink-0">
                          Active
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex-shrink-0">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        SIREN {company.siren}
                      </span>
                      {company.siege?.activite_principale && (
                        <span className="text-[10px] text-muted-foreground">
                          NAF {company.siege.activite_principale}
                        </span>
                      )}
                      {company.nature_juridique && (
                        <span className="text-[10px] text-muted-foreground">
                          {legalFormLabel(company.nature_juridique)}
                        </span>
                      )}
                    </div>
                    {company.siege?.adresse && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {company.siege.adresse}, {company.siege.code_postal} {company.siege.libelle_commune}
                      </div>
                    )}
                  </div>
                </button>
              ))}
              <div className="px-4 py-2 bg-muted/20 border-t border-border/40">
                <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5 text-success" />
                  Source : annuaire-entreprises.data.gouv.fr — données officielles de l'État
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aucun résultat */}
        {showCompanyList && !companyLoading && companySuggestions.length === 0 && companyQuery.length >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-xl px-4 py-3 text-xs text-muted-foreground">
            Aucune entreprise trouvée pour "<strong>{companyQuery}</strong>"
          </motion.div>
        )}
      </div>

      {/* ── Champs verrouillés ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isLocked && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="space-y-3">

            <div className="grid grid-cols-2 gap-3">
              {/* SIREN */}
              <LockedField label="SIREN" value={value.siren || ""} />
              {/* SIRET siège */}
              <LockedField label="SIRET (siège)" value={value.siret || ""} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Code NAF */}
              <LockedField label="Code NAF" value={value.nafCode || ""} />
              {/* Forme juridique */}
              <LockedField label="Forme juridique" value={value.legalForm || ""} />
            </div>

            {/* TVA — libre (calculée mais modifiable) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Numéro TVA</Label>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Unlock className="h-2.5 w-2.5" />Modifiable
                </span>
              </div>
              <Input
                value={value.tvaNumber || ""}
                onChange={e => onChange({ ...value, tvaNumber: e.target.value })}
                placeholder="FR00123456789"
                className="h-9 text-sm font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Calculé automatiquement — vérifiez sur{" "}
                <a href="https://ec.europa.eu/taxation_customs/vies/" target="_blank"
                  rel="noopener noreferrer" className="text-primary hover:underline">
                  le portail VIES
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Recherche adresse ──────────────────────────────────────────────── */}
      {showAddressSearch && (
        <div ref={addressRef} className="relative space-y-3">

          {/* Sélecteur pays */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Pays</Label>
            <select value={country}
              onChange={e => { setCountry(e.target.value); onChange({ ...value, country: e.target.value }); }}
              className="w-full h-9 text-sm bg-background border border-border rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="FR">🇫🇷 France</option>
              <option value="BE">🇧🇪 Belgique</option>
              <option value="CH">🇨🇭 Suisse</option>
              <option value="LU">🇱🇺 Luxembourg</option>
              <option value="DE">🇩🇪 Allemagne</option>
              <option value="ES">🇪🇸 Espagne</option>
              <option value="IT">🇮🇹 Italie</option>
              <option value="GB">🇬🇧 Royaume-Uni</option>
              <option value="US">🇺🇸 États-Unis</option>
            </select>
          </div>

          {/* Input adresse avec autocomplete */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Adresse</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {addressLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Input
                value={addressQuery}
                onChange={e => { setAddressQuery(e.target.value); setShowAddressList(true);
                  onChange({ ...value, address: e.target.value }); }}
                onFocus={() => addressSuggestions.length > 0 && setShowAddressList(true)}
                placeholder="Commencez à taper l'adresse..."
                className="pl-9 h-9 text-sm"
                autoComplete="off"
              />
            </div>

            {/* Label API utilisée */}
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              {country === "FR"
                ? <><CheckCircle className="h-2.5 w-2.5 text-success" />API BAN — Base Adresse Nationale officielle</>
                : <><MapPin className="h-2.5 w-2.5" />Google Maps Places</>}
            </p>

            {/* Suggestions adresse */}
            <AnimatePresence>
              {showAddressList && addressSuggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                  {addressSuggestions.map((suggestion, i) => (
                    <button key={i} onClick={() => selectAddress(suggestion)}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left border-b border-border/40 last:border-0">
                      <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm">{suggestion.address}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {suggestion.postalCode} {suggestion.city}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Champs adresse détaillés */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Ville</Label>
              <Input value={value.city || ""} onChange={e => onChange({ ...value, city: e.target.value })}
                placeholder="Paris" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Code postal</Label>
              <Input value={value.postalCode || ""} onChange={e => onChange({ ...value, postalCode: e.target.value })}
                placeholder="75001" className="h-9 text-sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CHAMP VERROUILLÉ ─────────────────────────────────────────────────────────

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        <Lock className="h-2.5 w-2.5 text-muted-foreground/50" />
      </div>
      <div className="h-9 px-3 flex items-center bg-muted/30 border border-border/50 rounded-lg">
        <span className="text-sm font-mono text-foreground/80">{value || "—"}</span>
      </div>
    </div>
  );
}
