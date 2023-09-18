import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import type { User } from "supabase-auth-helpers-astro";

export default function Menu({ user }: { user: User | null }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li>
                <NavigationMenuLink asChild>
                  <a
                    href="https://web.itu.edu.tr/durgunor/ders.htm"
                    target="_blank"
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    <div className="text-sm font-medium leading-none">Ders Seçim Rehberi</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Lolololololo</p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          {user ? (
            <>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                <a href="">{user.email}</a>
              </NavigationMenuLink>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                <a href="/logout">Logout</a>
              </NavigationMenuLink>
            </>
          ) : (
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <a href="/login">Login</a>
            </NavigationMenuLink>
          )}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

{
  /* <ul class="dropdown-menu" role="menu">
  <li><a href="https://web.itu.edu.tr/durgunor/ders.htm" target="_blank">Ders Seçim Rehberi</a></li>
  <li>
    <a href="https://web.itu.edu.tr/durgunor/itusch.htm" target="_blank">ITUscheduler Nasıl Kullanılır?</a>
  </li>
  <li><a href="https://web.itu.edu.tr/durgunor/crn.html" target="_blank">Fill CRN Test</a></li>
</ul>
<ul class="dropdown-menu" role="menu">
  <li><a href="/admin/refresh-majors">Refresh Major Codes</a></li>
  <li><a href="/admin/refresh-courses">Refresh Courses</a></li>
  <li><a href="/admin/populate-db">Populate DB (Debugging)</a></li>
</ul> */
}
