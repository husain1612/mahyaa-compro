import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import type { Faq } from '@/types'

export const FaqAccordion = ({ items }: { items: Faq[] }) => (
  <Accordion.Root type="single" collapsible className="divide-y divide-border rounded-xl border border-border bg-surface">
    {items.map((f) => (
      <Accordion.Item key={f.id} value={f.id}>
        <Accordion.Header>
          <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-medium hover:text-primary">
            {f.question}<ChevronDown className="h-5 w-5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="px-5 pb-4 text-sm text-muted">{f.answer}</Accordion.Content>
      </Accordion.Item>
    ))}
  </Accordion.Root>
)
