import { Building2, Globe, Phone, Mail, Scale } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="py-16 px-4">
      <div className="container max-w-3xl mx-auto">

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary shadow-glow mb-4">
            <Scale className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3">Mentions légales</h1>
          <p className="text-muted-foreground">
            Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.
          </p>
        </div>

        <div className="space-y-6">

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-display font-semibold">Éditeur du site</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-1.5">
                <p><span className="font-medium text-foreground">Société :</span> M7Sept SAS</p>
                <p><span className="font-medium text-foreground">Forme juridique :</span> Société par Actions Simplifiée</p>
                <p><span className="font-medium text-foreground">Capital social :</span> 10 000 €</p>
                <p><span className="font-medium text-foreground">SIRET :</span> 000 000 000 00000</p>
              </div>
              <div className="space-y-1.5">
                <p><span className="font-medium text-foreground">RCS :</span> Paris B 000 000 000</p>
                <p><span className="font-medium text-foreground">TVA intra. :</span> FR00 000000000</p>
                <p><span className="font-medium text-foreground">Adresse :</span> 1 rue de la Paix, 75001 Paris</p>
                <p><span className="font-medium text-foreground">Directeur de publication :</span> M7Sept SAS</p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-display font-semibold">Hébergement</h2>
            </div>
            <div className="text-sm text-muted-foreground space-y-1.5">
              <p><span className="font-medium text-foreground">Hébergeur :</span> Amazon Web Services (AWS)</p>
              <p><span className="font-medium text-foreground">Région :</span> eu-west-3 (Paris, France)</p>
              <p><span className="font-medium text-foreground">Adresse :</span> 31 Pl. des Corolles, 92400 Courbevoie, France</p>
              <p><span className="font-medium text-foreground">Certification :</span> ISO 27001, SOC 2, HDS (Hébergement Données de Santé)</p>
            </div>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-display font-semibold">Contact</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href="mailto:contact@m7sept.fr" className="hover:text-primary transition-colors">
                    contact@m7sept.fr
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+33 1 00 00 00 00</span>
                </div>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium text-foreground">Support :</span> support@m7sept.fr</p>
                <p><span className="font-medium text-foreground">Juridique :</span> legal@m7sept.fr</p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-display font-semibold">Propriété intellectuelle</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              L'ensemble du contenu de ce site (textes, images, graphiques, logo, icônes, logiciel)
              est la propriété exclusive de M7Sept SAS et est protégé par les lois françaises et
              internationales relatives à la propriété intellectuelle. Toute reproduction, distribution,
              modification ou utilisation à des fins commerciales sans autorisation écrite préalable
              de M7Sept SAS est strictement interdite.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
