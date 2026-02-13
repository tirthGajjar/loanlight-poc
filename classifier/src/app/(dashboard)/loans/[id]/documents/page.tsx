import { LoanDocuments } from "@/components/loans/loan-documents";

export default async function LoanDocumentsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <LoanDocuments loanId={id} />;
}
