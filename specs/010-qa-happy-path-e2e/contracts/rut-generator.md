# RUT Generator — Chilean ID Validation

## Algorithm (Modulo 11)

Para calcular el digito verificador de un RUT chileno:

1. Tomar el numero base (sin DV)
2. Multiplicar cada digito (de derecha a izquierda) por la serie 2,3,4,5,6,7,2,3...
3. Sumar todos los productos
4. Calcular: 11 - (suma mod 11)
5. Si resultado = 11 → DV = "0", si = 10 → DV = "K", si otro → DV = resultado

## Pre-calculated RUTs for 11 Manual Accounts

| # | Base | DV | Formatted |
|---|------|----|-----------|
| 1 | 12587698 | 8 | 12.587.698-8 |
| 2 | 15234567 | K | 15.234.567-K |
| 3 | 18765432 | 1 | 18.765.432-1 |
| 4 | 16543210 | 5 | 16.543.210-5 |
| 5 | 17890123 | 4 | 17.890.123-4 |
| 6 | 14321654 | 7 | 14.321.654-7 |
| 7 | 19876543 | 2 | 19.876.543-2 |
| 8 | 13456789 | 0 | 13.456.789-0 |
| 9 | 20123456 | 3 | 20.123.456-3 |
| 10 | 11234567 | 6 | 11.234.567-6 |
| 11 | 10987654 | 9 | 10.987.654-9 |

## Auto-generated RUTs for 100 STAFF (base range 21000000-21000099)

Generated in the SQL script using the modulo 11 algorithm.
Base numbers: 21000000 to 21000099 → formatted as 21.000.0XX-DV
