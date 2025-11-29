# Servicio de Acortamiento de URL

Este proyecto implementa un **servicio de acortamiento de URLs** utilizando **Node.js 18**, **JavaScript**, **AWS Lambda**, **API Gateway** y **DynamoDB**. Este README resume completamente la arquitectura, endpoints, datos necesarios, ejemplos y detalles para que cualquier miembro del equipo pueda continuar con los módulos restantes.sss

---

## Tecnologías y versiones

- **Lenguaje:** JavaScript (Node.js)
- **Runtime:** Node.js **18.x**
- **Servicios AWS:**

  - Lambda
  - API Gateway (REST)
  - DynamoDB

- **Cliente de pruebas:** Postman o Thunder Client (VSCode)

---

## Arquitectura General

El servicio recibe una URL larga, genera un código acortado y guarda el registro en DynamoDB. Luego expone endpoints para:

1. Crear un enlace corto (POST)
2. Recuperar la URL original (GET)
3. Verificar el estado del servicio (GET /health)

---

## Endpoints expuestos

### 1. **POST /shorten**

Crea un enlace corto.

**Body requerido (JSON):**

```json
{
  "originalUrl": "https://ejemplo.com/ruta/larga"
}
```

**Response (200):**

```json
{
  "code": "Mmqdhn",
  "short_url": "https://shorter.com/Mmqdhn",
  "long_url": "https://youtu.be/xFrGuyw1V8s?si=Biwdg-LYqohj05Px"
}
```

**Errores posibles:**

- `400`: Falta el parámetro `originalUrl`
- `500`: Error interno en Lambda

---

### 2. **GET /{code}**

Obtiene el registro del código acortado.

**Parámetro de ruta:** `code` (string)

**Response (200):**

```RUTA:
{
  "code": "A1b2C",
  "originalUrl": "https://ejemplo.com/ruta/larga"
}
```

**En caso de error saldría el siguiente mensaje: Error (404):**

```json
{ "message": "URL not found" }
```

---

### 3. **GET /code**

Para solicitar get colocamos lo siguiente.

**Url de busqueda:**

```json
https://olndh6z7eh.execute-api.us-east-1.amazonaws.com/prod/CODIGO_DE_LA_URL
```

---

**Respuesta:**

```json
{
  "code": "TsAUga",
  "long_url": "https://x.com/eswikipedia?lang=es",
  "hits": 1
}
```

---

## Formato de los códigos generados

El código acortado tiene:

- Longitud: **5 caracteres**
- Caracteres permitidos: **a–z, A–Z, 0–9**
- Generación: se usa una función aleatoria basada en la longitud definida

Ejemplo: `A1b2C`

---

## Estructura en DynamoDB

Cada URL acortada se almacena como un elemento con la siguiente estructura:

| Atributo      | Tipo   | Descripción                |
| ------------- | ------ | -------------------------- |
| `code`        | String | Código único acortado (PK) |
| `createdAt`   | String | Fecha ISO de creación      |
| `hits`        | number |                            |
| `originalUrl` | String | URL original completa      |

**Ejemplo de ítem guardado:**

```json
{
  "code": "A1b2C",
  "originalUrl": "https://x.com/eswikipedia?lang=es",
  "createdAt": "2025-11-28T18:42:00.123Z"
}
```

---

## Flujo actual del funcionamiento del sistema

1. **POST /shorten** recibe la URL larga
2. Se genera un código aleatorio de 6 caracteres
3. Se registra en DynamoDB
4. Se devuelve la URL corta
5. Cuando un cliente consulta **GET /{code}**:

   - Se busca en DynamoDB usando `code` como clave
   - Se retorna la URL original.

---

## Puerto de conexión (para Postman / Thunder Client)

La API está desplegada mediante API Gateway. El endpoint general es:

```
https://olndh6z7eh.execute-api.us-east-1.amazonaws.com/prod/
```

Ejemplos:

- **POST:** `https://olndh6z7eh.execute-api.us-east-1.amazonaws.com/prod/shorten`
- **GET:** `https://olndh6z7eh.execute-api.us-east-1.amazonaws.com/prod/TsAUga`
- **GET health:** `https://olndh6z7eh.execute-api.us-east-1.amazonaws.com/prod/health`

Este es el mismo endpoint que se usa en Postman o Thunder Client.

---

## Ejemplos visuales (Postman / Thunder Client)

Incluye capturas de ejemplo de **cada endpoint en ejecución**, como:

- POST /shorten enviando el body
- GET /{code} mostrando la respuesta con la URL original
- GET /health

## Estructura del proyecto

```
modulo1-shortener/
├─ lambda/
│  └─ index.js
├─ terraform/
│  ├─ main.tf
│  ├─ variables.tf
│  ├─ outputs.tf
│  └─ versions.tf
|  └─ dynamodb.tf
|   └─ get.tf
├─ .github/
│  └─ workflows/
│     └─ ci-cd.yml
├─ .gitignore
└─ README.md

```

---

## Indicaciones para los demás integrantes del equipo

- Reutilizar la misma estructura y estilo de handlers.
- Mantener el esquema de DynamoDB para nuevos módulos.
- Agregar nuevos endpoints dentro del mismo API Gateway stage (`prod`).

---

## Estado actual del módulo

- Generación de códigos: **Listo**
- DynamoDB: **Listo**
- Endpoints /shorten y /{code}: **Listos**
- Deploy funcionando correctamente desde AWS

---
