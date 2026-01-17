# Design Data Model - Immobilier

## Vue d'ensemble

```mermaid
erDiagram
    Member ||--o{ PropertyMember : owns
    Property ||--o{ PropertyMember : "owned by"
    Property ||--o{ Loan : has
    Property ||--o| PropertyInsurance : "assuré par (PNO/MRH)"
    Property ||--o| CoOwnership : "syndic/copro"
    Property ||--o{ UtilityContract : "contrats (EDF, GDF...)"

    Loan ||--o{ LoanInsurance : "couvert par"
    Member ||--o{ LoanInsurance : "souscrit"
```

---

## Entités principales

### Property

```mermaid
erDiagram
    Property {
        string id PK
        string name "Ex: Appart Paris 11e"
        PropertyType type "HOUSE, APARTMENT"
        PropertyUsage usage "PRIMARY, SECONDARY, RENTAL"
        string address
        string address2 "nullable"
        string city
        string postalCode
        float surface "m²"
        int rooms "nullable, nb pièces"
        int bedrooms "nullable"
        float purchasePrice
        date purchaseDate
        float notaryFees
        float agencyFees "nullable"
        float currentValue
        float rentAmount "nullable, loyer si RENTAL"
        float rentCharges "nullable, charges locataires"
        string notes "nullable"
        datetime createdAt
        datetime updatedAt
    }
```

### PropertyMember (copropriété entre membres)

```mermaid
erDiagram
    PropertyMember {
        string id PK
        string propertyId FK
        string memberId FK
        float ownershipShare "% de détention"
        datetime createdAt
    }
```

### Loan

```mermaid
erDiagram
    Loan {
        string id PK
        string propertyId FK "nullable"
        string memberId FK
        string name
        string lender "Banque ou nom du prêteur (vide si familial)"
        string loanNumber "nullable"
        float initialAmount
        float remainingAmount
        float rate "taux % - peut être 0 pour familial"
        float monthlyPayment
        date startDate
        date endDate "nullable"
        string notes "nullable"
        datetime createdAt
        datetime updatedAt
    }
```

---

## Assurances, Charges, Contrats

### PropertyInsurance (PNO/MRH) - 1:1 avec Property

```mermaid
erDiagram
    PropertyInsurance {
        string id PK
        string propertyId FK
        InsuranceType type "PNO, MRH"
        string provider "MAIF, AXA..."
        string contractNumber "nullable"
        float monthlyPremium
        date startDate
        date endDate "nullable"
        string coverage "nullable"
        string link "nullable"
        string notes "nullable"
    }
```

### LoanInsurance (assurance emprunteur) - N par Loan, liée à 1 Member

```mermaid
erDiagram
    LoanInsurance {
        string id PK
        string loanId FK
        string memberId FK "Qui est assuré/prélevé"
        string name "Ex: Assurance décès-invalidité"
        string provider "CNP, Cardif..."
        string contractNumber "nullable"
        float coveragePercent "50, 100..."
        float monthlyPremium
        string link "nullable"
        string notes "nullable"
    }
```

### CoOwnership (syndic/copro) - 1:1 avec Property

```mermaid
erDiagram
    CoOwnership {
        string id PK
        string propertyId FK
        string name "Ex: Foncia, Nexity"
        float quarterlyAmount
        string link "nullable"
        string notes "nullable"
    }
```

### UtilityContract (EDF, GDF, eau, internet...) - N par Property

```mermaid
erDiagram
    UtilityContract {
        string id PK
        string propertyId FK
        UtilityType type "ELECTRICITY, GAS, WATER, INTERNET, OTHER"
        string provider "EDF, Engie..."
        string contractNumber "nullable"
        float monthlyAmount
        string link "nullable"
        string notes "nullable"
    }
```

---

## Enums

```typescript
enum PropertyType {
  HOUSE       // Maison
  APARTMENT   // Appartement
}

enum PropertyUsage {
  PRIMARY     // Résidence principale
  SECONDARY   // Résidence secondaire
  RENTAL      // Investissement locatif
}

enum InsuranceType {
  PNO   // Propriétaire Non Occupant (locatif)
  MRH   // Multirisque Habitation (résidence)
}

enum UtilityType {
  ELECTRICITY
  GAS
  WATER
  INTERNET
  OTHER
}
```

---

## Décisions de design

| Aspect | Décision |
|--------|----------|
| Tenant/Locataire | Pas de table dédiée, juste `rentAmount` et `rentCharges` sur Property |
| LoanType | Supprimé - `lender` vide = prêt familial |
| Loan.insuranceMonthly | Supprimé - géré via LoanInsurance (plus flexible, multi-assuré) |
| PropertyValuation | Pas d'historique - juste `currentValue` sur Property |
| PropertyInsurance | 1:1 avec Property (un seul contrat PNO ou MRH) |
| CoOwnership | 1:1 avec Property, montant trimestriel uniquement |
| LoanInsurance | Lié à Loan ET Member (chaque co-emprunteur a sa ligne) |

---

## Modèle complet validé

```mermaid
erDiagram
    Member ||--o{ PropertyMember : owns
    Member ||--o{ LoanInsurance : "assuré par"
    Member ||--o{ Loan : "détient"

    Property ||--o{ PropertyMember : "owned by"
    Property ||--o{ Loan : has
    Property ||--o| PropertyInsurance : "assuré par"
    Property ||--o| CoOwnership : "copro"
    Property ||--o{ UtilityContract : "contrats"

    Loan ||--o{ LoanInsurance : "couvert par"

    Property {
        string id PK
        string name
        PropertyType type
        PropertyUsage usage
        string address
        string address2 "nullable"
        string city
        string postalCode
        float surface
        int rooms "nullable"
        int bedrooms "nullable"
        float purchasePrice
        date purchaseDate
        float notaryFees
        float agencyFees "nullable"
        float currentValue
        float rentAmount "nullable"
        float rentCharges "nullable"
        string notes "nullable"
    }

    PropertyMember {
        string id PK
        string propertyId FK
        string memberId FK
        float ownershipShare
    }

    Loan {
        string id PK
        string propertyId FK "nullable"
        string memberId FK
        string name
        string lender "nullable"
        string loanNumber "nullable"
        float initialAmount
        float remainingAmount
        float rate
        float monthlyPayment
        date startDate
        date endDate "nullable"
        string notes "nullable"
    }

    PropertyInsurance {
        string id PK
        string propertyId FK
        InsuranceType type
        string provider
        string contractNumber "nullable"
        float monthlyPremium
        date startDate
        date endDate "nullable"
        string coverage "nullable"
        string link "nullable"
        string notes "nullable"
    }

    LoanInsurance {
        string id PK
        string loanId FK
        string memberId FK
        string name
        string provider
        string contractNumber "nullable"
        float coveragePercent
        float monthlyPremium
        string link "nullable"
        string notes "nullable"
    }

    CoOwnership {
        string id PK
        string propertyId FK
        string name
        float quarterlyAmount
        string link "nullable"
        string notes "nullable"
    }

    UtilityContract {
        string id PK
        string propertyId FK
        UtilityType type
        string provider
        string contractNumber "nullable"
        float monthlyAmount
        string link "nullable"
        string notes "nullable"
    }
```

---

## Status

- [x] Property - validé
- [x] PropertyMember - validé
- [x] Loan - validé
- [x] PropertyInsurance (PNO/MRH) - validé
- [x] LoanInsurance (assurance emprunteur) - validé, FK directe vers Loan + Member
- [x] CoOwnership (syndic) - validé
- [x] UtilityContract (EDF, GDF...) - validé
- [x] Enums - validés

**Prêt pour le PRD !**
