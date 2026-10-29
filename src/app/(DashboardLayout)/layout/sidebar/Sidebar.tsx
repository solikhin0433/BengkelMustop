import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import SidebarContent from './sidebaritems'
import SimpleBar from 'simplebar-react'
import { Icon } from '@iconify/react'
import FullLogo from '../shared/logo/FullLogo'
import { Button } from '@/components/ui/button'
import {
  AMLogo,
  AMMenu,
  AMMenuItem,
  AMSidebar,
  AMSubmenu,
} from 'tailwind-sidebar'
import 'tailwind-sidebar/styles.css'

interface SidebarItemType {
  heading?: string
  id?: number | string
  name?: string
  title?: string
  icon?: string
  url?: string
  children?: SidebarItemType[]
  disabled?: boolean
  isPro?: boolean
}

const renderSidebarItems = (
  items: SidebarItemType[],
  currentPath: string,
  onClose?: () => void,
  isSubItem: boolean = false
) => {
  return items.map((item, index) => {
    const isSelected = currentPath === item?.url
    const IconComp = item.icon || null

    const iconElement = IconComp ? (
      <Icon icon={IconComp} height={21} width={21} />
    ) : (
      <Icon icon={'ri:checkbox-blank-circle-line'} height={9} width={9} />
    )

    // Heading
    if (item.heading) {
      return (
        <div className='mb-1' key={item.heading}>
          <AMMenu
            subHeading={item.heading}
            ClassName='hide-menu leading-21 text-sidebar-foreground dark:text-sidebar-foreground font-bold uppercase text-xs'
          />
        </div>
      )
    }

    // Submenu
    if (item.children?.length) {
      return (
        <AMSubmenu
          key={item.id}
          icon={iconElement}
          title={item.name}
          ClassName='mt-0.5 text-sidebar-foreground dark:text-sidebar-foreground'>
          {renderSidebarItems(item.children, currentPath, onClose, true)}
        </AMSubmenu>
      )
    }

    // Regular menu item
    const link = item.url?.startsWith('http') ? '#!' : item.url

    const itemClassNames = isSubItem
      ? `mt-0.5 text-sidebar-foreground dark:text-sidebar-foreground !hover:bg-transparent ${
          isSelected ? '!bg-transparent !text-primary' : ''
        } !px-1.5`
      : `mt-0.5 text-sidebar-foreground dark:text-sidebar-foreground`

    return (
      <div onClick={onClose} key={index}>
        <AMMenuItem
          key={item.id}
          icon={iconElement}
          isSelected={isSelected}
          link={link || undefined}
          target='_self'
          badge={!!item.isPro}
          badgeColor='bg-lightsecondary'
          badgeTextColor='text-secondary'
          disabled={item.disabled}
          badgeContent={item.isPro ? 'Pro' : undefined}
          component={Link}
          className={`${itemClassNames}`}>
          <span className='truncate flex-1'>{item.title || item.name}</span>
        </AMMenuItem>
      </div>
    )
  })
}

const SidebarLayout = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname()
  const { theme } = useTheme()

  // Only allow "light" or "dark" for AMSidebar
  const sidebarMode = theme === 'light' || theme === 'dark' ? theme : undefined

  return (
    <AMSidebar
      collapsible='none'
      animation={true}
      showProfile={false}
      width={'270px'}
      showTrigger={false}
      mode={sidebarMode}
      className='fixed left-0 top-0 border border-border bg-sidebar dark:bg-sidebar z-10 h-screen'>
      {/* Logo */}
      <div className='px-6 flex items-center brand-logo overflow-hidden'>
        <AMLogo component={Link} href='/admin' img=''>
          <FullLogo />
        </AMLogo>
      </div>

      {/* Sidebar items */}

      <SimpleBar className='h-[calc(100vh-100px)]'>
        <div className='px-6'>
          {SidebarContent.map((section, index) => (
            <div key={index}>
              {renderSidebarItems(
                [
                  ...(section.heading ? [{ heading: section.heading }] : []),
                  ...(section.children || []),
                ],
                pathname,
                onClose
              )}
            </div>
          ))}

          {/* Bengkel_Mustop Info Section */}
          <div className='mt-8 mb-6 overflow-hidden'>
            <div className='flex flex-col w-full bg-lightprimary rounded-lg p-4 border border-primary/20'>
              <div className='flex items-center gap-2 mb-1'>
                <span className='h-2 w-2 rounded-full bg-success animate-pulse' />
                <span className='text-xs font-bold text-primary'>Bengkel_Mustop v1.1</span>
              </div>
              <p className='text-xs text-sidebar-foreground'>
                Sistem Operasional & Kasir Bengkel Motor
              </p>
              <Link href='/' target='_blank' className='mt-3'>
                <Button variant='outline' size='sm' className='w-full text-xs h-8 border-primary/30'>
                  Buka Web Publik ↗
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SimpleBar>
    </AMSidebar>
  )
}

export default SidebarLayout
