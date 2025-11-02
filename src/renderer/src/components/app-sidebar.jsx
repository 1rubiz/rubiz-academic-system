// import * as React from 'react'
import {
  // BookOpen,
  // Bot,
  // // Frame,
  // // Map,
  // // PieChart,
  // // Settings2,
  // Settings,
  SquareTerminal
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
  // SidebarRail
} from '@/components/ui/sidebar'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard/home',
      icon: SquareTerminal,
      isActive: true,
      items: [
        // {
        //   title: "Session",
        //   url: "/dashboard/session",
        // },
        {
          title: 'Management System',
          url: '/dashboard/home'
        },
        {
          title: 'Update Manager',
          url: '/dashboard/updates'
        }
        // {
        //   title: "Result",
        //   url: "/dashboard/result",
        // },
        // {
        //   title: "Faculty",
        //   url: "/dashboard/faculty",
        // },
        // {
        //   title: "Department",
        //   url: "/dashboard/departments",
        // },
        // {
        //   title: "Students",
        //   url: "/dashboard/students",
        // },
        // {
        //   title: "Course",
        //   url: "/dashboard/courses",
        // },
      ]
    }
    // {
    //   title: 'Students File',
    //   url: '#',
    //   icon: Bot,
    //   items: [
    //     {
    //       title: 'Students Records',
    //       url: '#'
    //     },
    //     {
    //       title: 'Score by Mark Sheet',
    //       url: '#'
    //     },
    //     {
    //       title: 'Course Registration Slip',
    //       url: '#'
    //     },
    //     {
    //       title: 'Course Result Slip',
    //       url: '#'
    //     }
    //   ]
    // },
    // {
    //   title: 'Reports',
    //   url: '#',
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: 'Records Listing',
    //       url: '#'
    //     },
    //     {
    //       title: 'Departmental Results',
    //       url: '#'
    //     },
    //     {
    //       title: 'Mark Sheet',
    //       url: '#'
    //     },
    //     {
    //       title: 'Transcript Data Capture',
    //       url: '#'
    //     },
    //     {
    //       title: 'Academic Records',
    //       url: '#'
    //     }
    //   ]
    // }
  ],
  projects: [
    //   {
    //     name: 'More ...',
    //     url: '/dashboard/more',
    //     icon: Settings
    // }
  ]
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props} className="bg-red-600">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  )
}
