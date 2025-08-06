package tsq.dev.ventastock.producto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DTORegistroProducto(
        @NotNull
        String codigo,
        @NotBlank
        String nombre,
        @NotNull
        Double precio,
        @NotNull
        int stock) {
}
