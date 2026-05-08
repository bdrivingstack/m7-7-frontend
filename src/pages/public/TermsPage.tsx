import { FileText, CreditCard, AlertTriangle, Scale, RefreshCw, Mail } from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "Objet et acceptation",
    content: [
      "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme SaaS M7Sept.",
      "En créant un compte ou en utilisant nos services, vous acceptez pleinement et sans réserve les présentes CGU.",
      "M7Sept est édité par M7Sept SAS, société par actions simplifiée au capital de 10 000 €, immatriculée au RCS de Paris.",
      "Ces CGU entrent en vigueur à la date de votre inscription et demeurent applicables pendant toute la durée de votre abonnement.",
    ],
  },
  {
    icon: CreditCard,
    title: "Abonnements et facturation",
    content: [
      "Les abonnements sont proposés en formules mensuelles ou annuelles selon les tarifs en vigueur sur notre page Tarifs.",
      "Le paiement est effectué par carte bancaire via notre prestataire sécurisé Stripe (certifié PCI-DSS).",
      "Les abonnements annuels bénéficient d'une remise de 20% par rapport au tarif mensuel.",
      "Toute période commencée est due dans son intégralité. Aucun remboursement prorata n'est accordé.",
      "M7Sept se réserve le droit de modifier ses tarifs avec un préavis de 30 jours par email.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Résiliation",
    content: [
      "Vous pouvez résilier votre abonnement à tout moment depuis votre espace Paramètres > Abonnement.",
      "La résiliation prend effet à la fin de la période en cours (mensuelle ou annuelle).",
      "À la résiliation, vos données sont conservées pendant 90 jours pour vous permettre de les exporter.",
      "Après ce délai, vos données sont supprimées conformément à notre politique de conservation.",
      "M7Sept peut résilier le compte en cas de violation grave des présentes CGU.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Utilisations interdites",
    content: [
      "Il est strictement interdit d'utiliser M7Sept à des fins illégales ou contraires aux lois françaises.",
      "Toute tentative de compromission de la sécurité de la plateforme est interdite.",
      "La revente, sous-licence ou mise à disposition du service à des tiers sans autorisation écrite est prohibée.",
      "L'utilisation de robots, scripts ou tout moyen automatisé pour accéder au service est interdite.",
      "Toute violation entraîne la résiliation immédiate du compte sans remboursement.",
    ],
  },
  {
    icon: Scale,
    title: "Responsabilité et garanties",
    content: [
      "M7Sept fournit la plateforme en l'état et ne garantit pas une disponibilité de 100% (SLA : 99,5%).",
      "M7Sept ne peut être tenu responsable des dommages indirects liés à l'utilisation du service.",
      "Vous êtes seul responsable des données que vous saisissez et de leur conformité légale.",
      "La responsabilité maximale de M7Sept est limitée au montant des abonnements des 12 derniers mois.",
      "Les données de démo sont fictives ; toute ressemblance avec des personnes réelles est fortuite.",
    ],
  },
  {
    icon: Mail,
    title: "Loi applicable et contact",
    content: [
      "Les présentes CGU sont soumises au droit français.",
      "Tout litige sera soumis à la compétence exclusive des tribunaux de Paris.",
      "Pour toute question relative aux CGU : legal@m7sept.fr",
      "Service client : support@m7sept.fr — Délai de réponse : 48h ouvrées.",
      "Adresse postale : M7Sept SAS, 1 rue de la Paix, 75001 Paris, France.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="py-16 px-4">
      <div className="container max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary shadow-glow mb-4">
            <FileText className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3">Conditions Générales d'Utilisation</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Dernière mise à jour : 1er janvier 2025. Veuillez lire attentivement ces conditions
            avant d'utiliser la plateforme M7Sept.
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
            Ces conditions peuvent être modifiées. Vous serez informé par email avec un préavis de 30 jours.
          </p>
          <p className="mt-1">
            Pour toute question :{" "}
            <a href="mailto:legal@m7sept.fr" className="text-primary hover:underline">
              legal@m7sept.fr
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
