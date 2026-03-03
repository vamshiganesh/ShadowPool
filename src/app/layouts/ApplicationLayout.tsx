import { AppSidebar } from '@/components/navigation/Sidebar'
import { ShellLayout } from './ShellLayout'

export function ApplicationLayout() {
  return <ShellLayout sidebar={<AppSidebar />} />
}
