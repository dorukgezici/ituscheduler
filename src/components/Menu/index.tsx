import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import type { User } from "@supabase/supabase-js";

export default function Menu({ user }: { user: User | null }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem className="hidden sm:list-item">
          <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-40">
              <li className="text-sm hover:bg-muted/50 p-4">
                <NavigationMenuLink asChild>
                  <a
                    href="https://web.itu.edu.tr/durgunor/ders.htm"
                    target="_blank"
                  >
                    Ders Seçim Rehberi
                  </a>
                </NavigationMenuLink>
              </li>
              <li className="text-sm hover:bg-muted/50 p-4">
                <NavigationMenuLink asChild>
                  <a
                    href="https://web.itu.edu.tr/durgunor/itusch.htm"
                    target="_blank"
                  >
                    Nasıl Kullanılır?
                  </a>
                </NavigationMenuLink>
              </li>
              <li className="text-sm hover:bg-muted/50 p-4">
                <NavigationMenuLink asChild>
                  <a
                    href="https://web.itu.edu.tr/durgunor/crn.html"
                    target="_blank"
                  >
                    Fill CRN Test
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {user?.role === "admin" && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul>
                <li className="text-sm hover:bg-muted/50 p-4">
                  <NavigationMenuLink asChild>
                    <a href="/admin/refresh-majors">Refresh Major Codes</a>
                  </NavigationMenuLink>
                </li>
                <li className="text-sm hover:bg-muted/50 p-4">
                  <NavigationMenuLink asChild>
                    <a href="/admin/refresh-courses">Refresh Courses</a>
                  </NavigationMenuLink>
                </li>
                <li className="text-sm hover:bg-muted/50 p-4">
                  <NavigationMenuLink asChild>
                    <a href="/admin/populate-db">Populate DB (Debugging)</a>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        <NavigationMenuItem>
          {user ? (
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              asChild
            >
              <a href="/logout">Logout</a>
            </NavigationMenuLink>
          ) : (
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              asChild
            >
              <a href="/login">Login</a>
            </NavigationMenuLink>
          )}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
