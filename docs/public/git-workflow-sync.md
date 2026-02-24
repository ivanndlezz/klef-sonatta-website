# Guía para Sincronizar Cambios con Git y GitHub

## Escenario

Cuando trabajas en tu rama local (`main`) mientras otro usuario (o el servidor) hace cambios en `origin/main`, ambos tienen commits diferentes. Esto se llama **divergencia de ramas**.

---

## Caso 1: Merge Simple (cambios no relacionados)

Cuando los cambios en local y remoto **no se afectan entre sí** (modifican archivos diferentes), el proceso es:

### Paso 1: Verificar el estado

```bash
git status
```

**Salida esperada si hay diverge:**

```
On branch main
Your branch and 'origin/main' have diverged,
and have 1 and 1 different commits each, respectively.
```

### Paso 2: Ver qué commits son diferentes

```bash
git log --oneline -5 && echo "---" && git log origin/main --oneline -5
```

Esto muestra:

- Tus commits locales
- Los commits remotos
- El commit común (base)

### Paso 3: Hacer pull con merge

```bash
git pull --no-rebase --no-edit
```

**¿Por qué `--no-rebase`?**

- Mantiene el historial de commits más claro
- Crea un "commit de merge" que muestra cuándo se fusionaron las ramas
- Es más seguro para proyectos colaborativos

### Paso 4: Publicar en GitHub

```bash
git push
```

---

## Caso 2: Conflictos de Archivos

Si ambos modifican el **mismo archivo**, Git mostrará conflictos:

### Paso 1: Ver conflictos

```bash
git status
```

Archivos en conflicto aparecerán como:

```
Unmerged paths:
  both modified:   index.html
```

### Paso 2: Resolver conflictos

Abre los archivos en conflicto y busca:

```html
<<<<<<< HEAD
<!-- Tu código -->
=======
<!-- Código del remoto -->
>>>>>>> origin/main
```

Edita manualmente para dejar el código correcto.

### Paso 3: Marcar como resuelto

```bash
git add archivo-con-conflicto.html
```

### Paso 4: Completar el merge

```bash
git commit -m "resolve: merge with origin/main"
```

### Paso 5: Publicar

```bash
git push
```

---

## Flujo de Trabajo Recomendado

### Antes de empezar a trabajar

1. Haz `git pull` para tener los últimos cambios
2. Trabaja en tus cambios locales
3. Antes de hacer push, verifica si hay cambios remotos:
   ```bash
   git fetch origin
   git log origin/main --oneline -3
   ```

### Después de hacer cambios remotos (desde servidor)

1. Verifica el estado:
   ```bash
   git status
   ```
2. Si hay diverge, haz merge:
   ```bash
   git pull --no-rebase
   ```
3. Resuelve conflictos si los hay
4. Publica:
   ```bash
   git push
   ```

---

## Comandos Útiles

| Comando                | Descripción                        |
| ---------------------- | ---------------------------------- |
| `git status`           | Ver estado actual                  |
| `git log --oneline -5` | Ver últimos 5 commits              |
| `git diff`             | Ver cambios locales                |
| `git fetch origin`     | Traer info del remoto sin fusionar |
| `git pull --no-rebase` | Pull con merge                     |
| `git push`             | Subir cambios a GitHub             |
| `git stash`            | Guardar cambios temporalmente      |

---

## Casos Especiales

### Guardar trabajo sin hacer commit

Si tienes cambios sin terminar y necesitas hacer pull:

```bash
git stash        # Guarda cambios temporalmente
git pull         # Trae cambios remotos
git stash pop    # Recupera tus cambios
```

### Descartar cambios locales

Si quieres descartar todo y empezar de cero:

```bash
git fetch origin
git reset --hard origin/main
```

---

## Referencias

- Rama actual: `main`
- Remoto: `origin` (https://github.com/ivanndlezz/klef-sonatta-website.git)
