import { Shield, Lock, Eye, Database, Bell, Mail } from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "Données collectées",
    content: [
      "Informations d'identification : nom, prénom, adresse email, numéro de téléphone.",
      "Données professionnelles : SIRET, numéro de TVA, raison sociale, adresse de facturation.",
      "Données de navigation : adresse IP, type de navigateur, pages visitées, durée de session.",
      "Données financières : historique des factures et paiements (chiffrées au repos et en transit).",
    ],
  },
  {
    icon: Eye,
    title: "Finalités du traitement",
    content: [
      "Fourniture du service SaaS de gestion financière M7Sept.",
      "Émission et gestion des factures électroniques conformément à la réglementation française.",
      "Amélioration continue du service et personnalisation de l'expérience utilisateur.",
      "Respect des obligations légales comptables et fiscales (conservation 10 ans).",
      "Envoi de communications relatives au compte et aux mises à jour importantes.",
    ],
  },
  {
    icon: Lock,
    title: "Base légale",
    content: [
      "Exécution du contrat (CGU acceptées lors de l'inscription).",
      "Obligation légale (conservation comptable, déclarations fiscales).",
      "Intérêt légitime (amélioration du service, sécurité).",
      "Consentement (communications marketing, si applicable).",
    ],
  },
  {
    icon: Shield,
    title: "Sécurité des données",
    content: [
      "Chiffrement TLS 1.3 pour toutes les transmissions de données.",
      "Chiffrement AES-256 pour les données stockées en base.",
      "Authentification à deux facteurs (2FA) disponible pour tous les comptes.",
      "Audits de sécurité réguliers et tests de pénétration.",
      "Accès restreint aux données personnelles par le principe du moindre privilège.",
    ],
  },
  {
    icon: Bell,
    title: "Vos droits (RGPD)",
    content: [
      "Droit d'accès : obtenir une copie de vos données personnelles.",
      "Droit de rectification : corriger des données inexactes ou incomplètes.",
      "Droit à l'effacement : demander la suppression de vos données (sous réserve des obligations légales).",
      "Droit à la portabilité : recevoir vos données dans un format structuré.",
      "Droit d'opposition : vous opposer au traitement dans certains cas.",
      "Droit à la limitation : demander la suspension temporaire du traitement.",
    ],
  },
  {
    icon: Mail,
    title: "Exercer vos droits",
    content: [
      "Pour exercer vos droits, contactez notre DPO à l'adresse : privacy@m7sept.fr",
      "Délai de réponse : 30 jours maximum à compter de la réception de votre demande.",
      "En cas de réclamation, vous pouvez contacter la CNIL : www.cnil.fr",
      "Responsable du traitement : M7Sept SAS — 1 rue de la Paix, 75001 Paris.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="py-16 px-4">
      <div className="container max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary shadow-glow mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3">Politique de confidentialité</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Dernière mise à jour : 1er janvier 2025. M7Sept s'engage à protéger vos données personnelles
            conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-display font-semibold">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 p-5 rounded-xl bg-muted/50 border border-border text-center text-sm text-muted-foreground">
          <p>
            Cette politique de confidentialité peut être mise à jour. Nous vous notifierons par email
            de tout changement significatif.
          </p>
          <p className="mt-1">
            Pour toute question :{" "}
            <a href="mailto:privacy@m7sept.fr" className="text-primary hover:underline">
              privacy@m7sept.fr
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
