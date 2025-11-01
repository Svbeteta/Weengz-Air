import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../services/api.service";
import { Asiento, Reservacion, Usuario } from "../../models";

@Component({
  selector: "app-xml-io",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./xml-io.component.html"
})
export class XmlIoComponent {
  resumen = "";
  processingMs: number | null = null;
  showPurgeModal = false;
  purgeConfirmText = "";
  isPurging = false;

  constructor(private api: ApiService) {}

  async exportar() {
    const t0 = performance.now();
    const reservaciones = await this.api.getReservaciones().toPromise() as Reservacion[];
    // Only include reserved seats (exclude canceladas). We export a compact format like the sample image.
    const soloReservadas = (reservaciones || []).filter(r => r.estado !== 'CANCELADA');
    const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<flightReservation>
${soloReservadas.map(r => `  <flightSeat>
    <seatNumber>${r.asiento}</seatNumber>
    <passengerName>${r.pasajero.nombreCompleto}</passengerName>
    <user>${r.usuario}</user>
    <idNumber>${r.pasajero.cui}</idNumber>
    <hasLuggage>${r.pasajero.tieneEquipaje}</hasLuggage>
    <reservationDate>${new Date(r.detalles.fechaReservacion).toLocaleString('es-GT')}</reservationDate>
  </flightSeat>`).join('\n')}
</flightReservation>
`;
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weengz-air-export.xml";
    a.click();
    URL.revokeObjectURL(url);
    const t1 = performance.now();
    this.processingMs = Math.round(t1 - t0);
    this.resumen = `Exportación completada (${soloReservadas.length} reservas exportadas).`;
  }

  importar(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    const t0 = performance.now();
    reader.onload = async () => {
      let ok = 0, fail = 0;
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(reader.result as string, "application/xml");
        const compactSeats = Array.from(doc.querySelectorAll("flightReservation > flightSeat"));
        if (compactSeats.length > 0) {
          // Nuevo esquema compacto (flightReservation/flightSeat)
          for (const fs of compactSeats) {
            try {
              const asiento = (fs.querySelector("seatNumber")?.textContent || "").trim();
              const usuario = (fs.querySelector("user")?.textContent || "").trim();
              const pasajero = {
                nombreCompleto: (fs.querySelector("passengerName")?.textContent || "").trim(),
                cui: (fs.querySelector("idNumber")?.textContent || "").trim(),
                tieneEquipaje: ((fs.querySelector("hasLuggage")?.textContent || "false").trim().toLowerCase() === 'true')
              };
              const fechaTxt = (fs.querySelector("reservationDate")?.textContent || "").trim();
              const fecha = this.parseDateFlexible(fechaTxt);
              // Precio base no está en esquema compacto; usamos 0 como valor neutro para pruebas
              await this.api.crearReservacionAtomica({
                usuario, asiento, pasajero,
                detalles: { fechaReservacion: fecha, metodoSeleccion: 'Manual', precioBase: 0 }
              }).toPromise();
              ok++;
            } catch { fail++; }
          }
        } else {
          // Esquema legado (Usuarios/Asientos/Reservaciones)
          const usuarios = Array.from(doc.querySelectorAll("Usuarios > Usuario"));
          const asientos = Array.from(doc.querySelectorAll("Asientos > Asiento"));
          const reservaciones = Array.from(doc.querySelectorAll("Reservaciones > Reservacion"));

          const uList = await this.api.getUsuarios().toPromise() as Usuario[];
          const aList = await this.api.getAsientos().toPromise() as Asiento[];
          const rList = await this.api.getReservaciones().toPromise() as Reservacion[];

          for (const u of usuarios) {
            try {
              const email = u.getAttribute("email")!;
              const esVip = u.getAttribute("esVip") === "true";
              const nombreCompleto = u.querySelector("nombreCompleto")?.textContent ?? "";
              const existing = uList.find(x => x.email === email);
              if (existing) {
                await this.api.actualizarUsuario(existing.id!, { nombreCompleto, esVip }).toPromise();
              } else {
                await this.api.crearUsuario({ email, esVip, nombreCompleto, fechaCreacion: new Date().toISOString() } as any).toPromise();
              }
              ok++;
            } catch { fail++; }
          }
          for (const a of asientos) {
            try {
              const numero = a.getAttribute("numero")!;
              const estado = (a.getAttribute("estado") as any) ?? "Libre";
              const existing = aList.find(x => x.numero === numero);
              if (existing) {
                await this.api.actualizarAsiento(existing.id, { estado }).toPromise();
              }
              ok++;
            } catch { fail++; }
          }
          for (const r of reservaciones) {
            try {
              const asiento = r.querySelector("asiento")?.textContent ?? "";
              const usuario = r.querySelector("usuario")?.textContent ?? "";
              const pasajero = {
                nombreCompleto: r.querySelector("pasajero > nombreCompleto")?.textContent ?? "",
                cui: r.querySelector("pasajero > cui")?.textContent ?? "",
                tieneEquipaje: (r.querySelector("pasajero > tieneEquipaje")?.textContent ?? "false") === "true"
              };
              const fechaTxt = r.querySelector("detalles > fechaReservacion")?.textContent ?? new Date().toISOString();
              const fecha = this.parseDateFlexible(fechaTxt);
              const metodo = (r.querySelector("detalles > metodoSeleccion")?.textContent ?? "Manual") as any;
              const precioBase = parseFloat(r.querySelector("detalles > precioBase")?.textContent ?? "0");

              await this.api.crearReservacionAtomica({
                usuario, asiento, pasajero,
                detalles: { fechaReservacion: fecha, metodoSeleccion: metodo, precioBase }
              }).toPromise();
              ok++;
            } catch { fail++; }
          }
        }

        const t1 = performance.now();
        this.processingMs = Math.round(t1 - t0);
        if (ok === 0 && fail === 0) {
          this.resumen = 'No se reconoció el formato del XML. Asegúrate de usar el esquema legado (Usuarios/Asientos/Reservaciones) o el compacto (flightReservation/flightSeat).';
        } else {
          this.resumen = `Importación terminada. Éxitos: ${ok}, Fallos: ${fail}.`;
        }
      } catch (e) {
        this.resumen = "Error al procesar XML.";
      }
    };
    reader.readAsText(file);
  }

  abrirPurgar() {
    this.purgeConfirmText = "";
    this.showPurgeModal = true;
  }
  cancelarPurgar() {
    this.showPurgeModal = false;
  }
  get puedePurgar() {
    return (this.purgeConfirmText || '').trim().toUpperCase() === 'BORRAR';
  }
  async confirmarPurgar() {
    if (!this.puedePurgar || this.isPurging) return;
    this.isPurging = true;
    try {
      const result = await this.api.purgarDatos().toPromise();
      this.resumen = `Purgado: eliminadas ${result?.deleted?.reservaciones ?? 0} reservaciones, ${result?.deleted?.modificaciones ?? 0} modificaciones; asientos liberados: ${result?.deleted?.seatsFreed ?? 0}.`;
    } catch (e) {
      this.resumen = 'No se pudo purgar los datos.';
    } finally {
      this.isPurging = false;
      this.showPurgeModal = false;
    }
  }

  private parseDateFlexible(input: string): string {
    if (!input) return new Date().toISOString();
    const d = new Date(input);
    if (!isNaN(d.getTime())) return d.toISOString();
    // Try dd/MM/yyyy HH:mm[:ss]
    const m = input.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) {
      const day = parseInt(m[1], 10);
      const mon = parseInt(m[2], 10) - 1;
      const yr = parseInt(m[3], 10);
      const hh = parseInt(m[4] || '0', 10);
      const mm = parseInt(m[5] || '0', 10);
      const ss = parseInt(m[6] || '0', 10);
      const dt = new Date(yr, mon, day, hh, mm, ss);
      return dt.toISOString();
    }
    return new Date().toISOString();
  }
}