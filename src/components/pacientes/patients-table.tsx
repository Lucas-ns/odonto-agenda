import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Patient } from "@/lib/db/schema";

type Props = {
  patients: Patient[];
};

function whatsappHref(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export function PatientsTable({ patients }: Props) {
  if (patients.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhum paciente encontrado. Cadastre o primeiro.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">Telefone</TableHead>
            <TableHead className="hidden md:table-cell">E-mail</TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((p) => {
            const wa = whatsappHref(p.phone);
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <Link
                    href={`/pacientes/${p.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {p.name}
                  </Link>
                  {p.consentAt ? (
                    <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                      Consentimento
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {p.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3.5" />
                      {p.phone}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {p.email ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {wa ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Abrir WhatsApp"
                        render={
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <MessageCircle className="size-4 text-secondary" />
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/pacientes/${p.id}`} />}
                    >
                      Abrir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
