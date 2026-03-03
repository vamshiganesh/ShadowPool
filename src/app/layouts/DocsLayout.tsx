import { DocsSidebar } from '@/components/navigation/Sidebar'
import { ShellLayout } from './ShellLayout'

export function DocsLayout() {
  return <ShellLayout sidebar={<DocsSidebar />} />
}
