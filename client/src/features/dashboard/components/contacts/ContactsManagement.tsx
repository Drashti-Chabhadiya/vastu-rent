import { useState } from 'react'
import { Search, Mail, MailOpen, Trash2 } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useAdminContacts, useMarkContactRead, useDeleteContact } from '#/hook'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'
import { useTranslation } from '#/context/TranslationContext'

export const ContactsManagement = () => {
  const { t, formatDate } = useTranslation()
  const [search, setSearch] = useState('')
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)

  const { data: contactsData, isLoading } = useAdminContacts()
  const markReadMutation = useMarkContactRead()
  const deleteMutation = useDeleteContact()

  // Filter contacts by search query
  const filteredContacts = contactsData?.filter(
    (contact: any) =>
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.subject.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header & Filters */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/30 shadow-sm"
      >
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-text-muted z-10"
            size={18}
          />
          <Input
            type="text"
            placeholder={t('Search messages...')}
            className="pl-10 h-11 bg-dash-bg-soft border-none rounded-xl text-sm text-dash-text placeholder:text-dash-text-muted focus-visible:ring-2 focus-visible:ring-dash-brand/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Contacts Table */}
      <motion.div
        variants={fadeUp}
        className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-left bg-muted-light/50 border-b border-border/30">
                <TableHead className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider w-[250px]">
                  {t('Sender')}
                </TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider">
                  {t('Subject & Message')}
                </TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider text-center w-[120px]">
                  {t('Date')}
                </TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider text-right w-[120px]">
                  {t('Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell
                      colSpan={4}
                      className="px-6 py-8 h-16 bg-muted-light/20"
                    ></TableCell>
                  </TableRow>
                ))
              ) : filteredContacts?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-6 py-12 text-center text-dash-text-muted text-sm"
                  >
                    {t('No contact messages found.')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts?.map((contact: any) => (
                  <TableRow
                    key={contact.id}
                    className={cn(
                      'transition-colors group',
                      !contact.isRead
                        ? 'bg-primary/5 hover:bg-primary/10'
                        : 'hover:bg-muted-light/50',
                    )}
                  >
                    <TableCell className="px-6 py-4 align-top">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-dash-text">
                          {contact.name}
                        </span>
                        <span className="text-xs text-dash-text-muted">
                          {contact.email}
                        </span>
                        {!contact.isRead && (
                          <Badge className="mt-2 w-max bg-primary-soft text-primary text-[10px]">
                            {t('New')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-top max-w-md">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-dash-text truncate">
                          {contact.subject}
                        </span>
                        <span className="text-xs text-dash-text-muted line-clamp-2">
                          {contact.message}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center text-xs text-dash-text-muted align-top whitespace-nowrap">
                      {formatDate(contact.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={
                            contact.isRead
                              ? t('Mark as unread')
                              : t('Mark as read')
                          }
                          onClick={() =>
                            markReadMutation.mutate({
                              id: contact.id,
                              isRead: !contact.isRead,
                            })
                          }
                          className={cn(
                            'h-9 w-9 rounded-xl transition-colors',
                            contact.isRead
                              ? 'text-muted-foreground hover:text-dash-text hover:bg-muted-light'
                              : 'text-primary hover:text-primary-hover hover:bg-primary-soft',
                          )}
                        >
                          {contact.isRead ? (
                            <Mail size={18} />
                          ) : (
                            <MailOpen size={18} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t('Delete Message')}
                          onClick={() => {
                            setContactToDelete(contact.id)
                          }}
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-danger rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <ReusableAlertDialog
        isOpen={contactToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setContactToDelete(null)
        }}
        onConfirm={() => {
          if (contactToDelete) {
            deleteMutation.mutate(contactToDelete)
            setContactToDelete(null)
          }
        }}
        title={t('Delete Message')}
        description={t(
          'Are you sure you want to permanently delete this contact message? This action is irreversible.',
        )}
        confirmText={t('Delete')}
        variant="danger"
      />
    </motion.div>
  )
}
