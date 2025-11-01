import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../services/api.service";
import { Asiento, ReporteResumen, Reservacion, Usuario } from "../../models";

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./reports.component.html"
})
export class ReportsComponent implements OnInit {
  resumen: ReporteResumen | null = null;
  asientos: Asiento[] = [];
  showSeatMapModal = false;
  businessRows = ["I","G","F","D","C","A"];
  economyRows  = ["I","H","G","F","E","D","C","B","A"];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getUsuarios().subscribe(users => {
      this.api.getAsientos().subscribe(seats => {
        this.asientos = seats;
        this.api.getReservaciones().subscribe(reservas => {
          this.resumen = this.compute(users, seats, reservas);
        });
      });
    });
  }

  private compute(users: Usuario[], seats: Asiento[], res: Reservacion[]): ReporteResumen {
    const usuariosCreados = users.length;
    const reservasPorUsuario: Record<string, number> = {};
    res.forEach(r => { reservasPorUsuario[r.usuario] = (reservasPorUsuario[r.usuario] ?? 0) + 1; });

    const ocupadosPorClase = { Negocios: 0, Economica: 0 } as any;
    const libresPorClase   = { Negocios: 0, Economica: 0 } as any;
    seats.forEach(s => {
      if (s.estado === "Ocupado") ocupadosPorClase[s.clase]++;
      else libresPorClase[s.clase]++;
    });

    let seleccionManual = 0, seleccionAleatorio = 0, modificados = 0, cancelados = 0;
    res.forEach(r => {
      if (r.detalles.metodoSeleccion === "Manual") seleccionManual++; else seleccionAleatorio++;
      modificados += (r.Modificaciones?.length ?? 0) > 0 ? 1 : 0;
      cancelados  += r.estado === "CANCELADA" ? 1 : 0;
    });

    return { usuariosCreados, reservasPorUsuario, ocupadosPorClase, libresPorClase, seleccionManual, seleccionAleatorio, modificados, cancelados };
  }

  seatsByRow(row: string, clase: "Negocios" | "Economica") {
    return this.asientos
      .filter(a => a.clase === clase && a.numero.startsWith(row))
      .sort((a,b) => a.numero.localeCompare(b.numero));
  }

  abrirDiagrama() { this.showSeatMapModal = true; }
  cerrarDiagrama() { this.showSeatMapModal = false; }
}