/**
 * /accountant/transactions — transaction list for the accountant user.
 */
import { createFileRoute } from '@tanstack/react-router'
import { AccountantTransactions } from '@/features/accountant/components/AccountantTransactions'

export const Route = createFileRoute('/accountant/transactions')({
  component: AccountantTransactions,
})