import type { ClassificationRule } from "../types";

export const PROPERTY_RULES: readonly ClassificationRule[] = [
	{
		type: "purchase_contract",
		description: `Real estate purchase contract. Contains buyer/seller names, property address, purchase price, contingencies, earnest money terms, multiple signature blocks.
NOT a deed (contract to purchase, not transfer of ownership).`,
	},
	{
		type: "grant_deed",
		description: `Grant Deed transferring property ownership. Contains grantor, grantee, legal description, APN. Look for "GRANT DEED" title.
NOT a Deed of Trust (transfers ownership, not secures a loan).`,
	},
	{
		type: "deed_of_trust",
		description: `Deed of Trust (mortgage security instrument). Contains borrower, lender (beneficiary), trustee, loan covenants. Look for "Deed of Trust", security instrument language.
NOT a Grant Deed (secures a loan, does not transfer ownership).`,
	},
	{
		type: "affidavit_of_title",
		description: `Affidavit of Title — sworn statement about property ownership, liens, debts, and possession. Contains attestations about outstanding judgments, bankruptcies, mechanic's liens, and parties in possession. Look for "Affidavit of Title", "Affidavit as to Debts", "Liens", "Possession".
NOT an owner affidavit (focuses on title status, not borrower identity).`,
	},
	{
		type: "owner_affidavit",
		description: `Borrower/Owner/Purchaser Affidavit or Indemnity Affidavit. Sworn statement by borrower confirming identity, occupancy intent, and indemnifying the title company. Look for "Owner Affidavit", "Purchaser Affidavit", "Indemnity Affidavit", "Borrower Affidavit".
NOT an Affidavit of Title (focuses on borrower declarations, not property title status).`,
	},
	{
		type: "name_affidavit",
		description: `Name Affidavit — sworn statement confirming that different name variations refer to the same person for title purposes. Contains name variations, explanations (maiden name, legal name change, typos). Look for "Name Affidavit", "also known as", "AKA", name variation lists.
NOT an identity document (clarifies name for title records, not government-issued ID).`,
	},
	{
		type: "hazard_insurance",
		description: `Hazard insurance policy or declarations page showing property coverage. Contains insurer name, policy number, coverage amounts, premium, property address. Look for "Hazard Insurance", "Homeowners Insurance", "Declarations Page", dwelling coverage.
NOT flood insurance (general hazard/homeowners coverage, not flood-specific).`,
	},
	{
		type: "flood_insurance",
		description: `Flood insurance policy or declarations page. Contains NFIP or private flood insurer, policy number, flood zone, coverage amounts, premium. Look for "Flood Insurance", "NFIP", flood coverage.
NOT hazard insurance (flood-specific coverage, not general homeowners).`,
	},
	{
		type: "flood_certificate",
		description: `Flood zone determination certificate. Contains FEMA flood zone designation, community number, map panel, property determination. Look for "Flood Certificate", "Flood Zone Determination", FEMA map reference.
NOT flood insurance (determination of zone, not insurance policy).`,
	},
	{
		type: "trust",
		description: `Trust agreement or trust certification related to property ownership. Contains trust name, trustee, beneficiaries, trust date. Look for "Trust", "Trustee", "Trust Agreement", "Trust Certification".
NOT a deed of trust (ownership trust, not mortgage security instrument).`,
	},
	{
		type: "tax_certificate",
		description: `Property tax certificate or tax statement showing taxes paid or due. Contains tax parcel number, assessed value, tax amounts, payment status. Look for "Tax Certificate", "Property Tax", county tax collector.
NOT a tax return (property tax, not income tax).`,
	},
	{
		type: "rental_agreement",
		description: `Rental or lease agreement for the subject property. Contains landlord/tenant names, lease terms, rent amount, property address. Look for "Lease Agreement", "Rental Agreement", tenant obligations.
NOT a purchase contract (rental terms, not sale terms).`,
	},
	{
		type: "entity_vesting",
		description: `Entity vesting documentation showing how title is held by a business entity (LLC, corporation, trust). Contains entity name, vesting type, ownership structure. Look for vesting instructions, entity ownership, title holding.
NOT articles of incorporation (how title is held, not business formation).`,
	},
	{
		type: "warranty_deed",
		description: `Warranty Deed transferring property with warranty of clear title. Contains grantor, grantee, legal description, warranty covenants. Look for "Warranty Deed", "General Warranty Deed", "Special Warranty Deed".
NOT a grant deed (includes warranty covenants, stronger title guarantee).`,
	},
];
