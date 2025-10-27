import { AppSidebar } from '../components/app-sidebar'
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator
// } from '../components/ui/breadcrumb'
// import { Separator } from '../components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  // const location = useLocation()
  // const locations = location.pathname.split('/')

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-primary" />
            {/* <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" /> */}
            {/* <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">ACADEMIC RECORDS</BreadcrumbLink>
                </BreadcrumbItem>
                {locations.map((item, key) => {
                  if (key !== 0) {
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                          <BreadcrumbPage className="text-white">
                            {item.toUpperCase()}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </div>
                    )
                  }
                })}
              </BreadcrumbList>
            </Breadcrumb> */}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-[95dvw] max-h-[93dvh] overflow-scroll scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-100">
          {/* {
                children
            } */}
          <Outlet />
          {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
