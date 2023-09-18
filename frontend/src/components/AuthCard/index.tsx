import SupabaseAuth from "@/components/SupabaseAuth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCard({ site }: { site?: URL }) {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>Login or Register</CardTitle>
      </CardHeader>
      <CardContent className="max-w">
        <SupabaseAuth site={site} />
      </CardContent>
      <CardFooter>
        <small className="italic">
          We do not guarantee or can be responsible for the accuracy of information found here. If in doubt, please
          check{" "}
          <a href="https://www.sis.itu.edu.tr" target="_blank" className="underline">
            SIS
          </a>
          .
        </small>
      </CardFooter>
    </Card>
  );
}
