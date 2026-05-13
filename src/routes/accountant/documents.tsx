/**
 * /accountant/documents — document list for the accountant user.
 */
import { createFileRoute } from '@tanstack/react-router'
import { AccountantDocuments } from '@/features/accountant/components/AccountantDocuments'

export const Route = createFileRoute('/accountant/documents')({
  component: AccountantDocuments,
})