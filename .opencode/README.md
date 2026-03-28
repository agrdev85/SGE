# Prompts de OpenCode para SGE

## Descripción

Esta carpeta contiene prompts optimizados para usar con el agente de IA **opencode** en el proyecto SGE (Sistema de Gestión de Eventos).

Los prompts están basados en las **mejores prácticas de context engineering** de Anthropic para agentes de IA.

## Estructura

```
.opencode-prompts/
├── templates/
│   └── mejores-practicas.md    # Guía general de mejores prácticas
├── tareas/                     # Prompts para tareas específicas
│   ├── codificar.md           # Crear nuevo código
│   ├── corregir.md            # Diagnosticar y arreglar bugs
│   ├── revisar.md            # Code review
│   ├── test.md               # Generar tests
│   ├── migrar.md             # Refactoring/migración
│   ├── explicar.md            # Explicar código
│   └── ui.md                 # Componentes de UI
└── estructurales/             # Prompts estructurales (WIP)
```

## Cómo usar

En opencode, escribe el comando con `$` para el parámetro:

```
/codificar Crear un formulario de login con validación de email
```

```
/corregir El diálogo de confirmación no se cierra después de confirmar
```

```
/revisar src/pages/Events.tsx
```

## Principios de los Prompts

1. **Contexto específico** - Incluyen información del proyecto
2. **Criterios de éxito claros** - Definen qué significa "bien hecho"
3. **Estructura consistente** - Secciones claras y predecibles
4. **Constraints explícitos** - Qué hacer y qué NO hacer
5. **Verificación** - Pasos para confirmar que funciona

## Mejores Prácticas (Anthropic)

### Para escribir prompts efectivos:

1. **Sé específico** - Instrucciones vagas dan resultados vagos
2. **Da contexto** - Incluye información relevante del proyecto
3. **Establece éxito** - Define criterios medibles
4. **Minimiza ruido** - Solo incluye lo necesario
5. **Usa ejemplos** - Los ejemplos son más claros que descripciones

### Para tareas de código:

1. **Identifica el qué** antes del cómo
2. **Conoce el contexto** del codebase
3. **Establece constraints** (conventions, patterns)
4. **Define verificación** (tests, build)

## Comandos Disponibles

| Comando | Uso |
|---------|-----|
| `/codificar` | Crear nueva funcionalidad |
| `/corregir` | Debug y arreglar bugs |
| `/revisar` | Code review |
| `/test` | Generar tests |
| `/migrar` | Refactoring |
| `/explicar` | Entender código |
| `/ui` | Componentes de UI |

## Contribuir

Para agregar un nuevo prompt:

1. Crea archivo en `tareas/[nombre].md`
2. Usa la estructura:
   - `# Comando /nombre`
   - `## Propósito`
   - `## Prompt` con `$VARIABLE` para parámetros
   - `## Uso` con ejemplos
3. Actualiza este README

## Referencias

- [Effective context engineering for AI agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Prompt engineering best practices - Claude](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
