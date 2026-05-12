import { createFileRoute } from '@tanstack/react-router'
import { AccountantDocuments } from '@/features/accountant/components/AccountantDocuments'

export const Route = createFileRoute('/accountant/documents')({
  component: AccountantDocuments,
})