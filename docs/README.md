# Dokümantasyon

Bu klasör; mimari diyagramları, teknik kararları, modül açıklamalarını ve veritabanı/politika notlarını içerir.

## Alt Klasörler

- `diagrams/` — PlantUML ile sistem diyagramları (mimari, modül, akış, ER, UI navigasyon)
- `decisions/` — ADR (Architecture Decision Record) taslakları (ileride)
- `guides/` — Kurulum ve kullanım rehberleri (ileride)

## Diyagramları Üretme

`diagrams/` altındaki `.puml` dosyalarını PlantUML ile işleyerek PNG/SVG üretebilirsiniz. Örnek:

```bash
# Java + plantuml.jar gerektirir
plantuml -tpng diagrams/system-architecture.puml
plantuml -tpng diagrams/module-architecture.puml
plantuml -tpng diagrams/db-schema.puml
plantuml -tpng diagrams/sequence-sales.puml
plantuml -tpng diagrams/sequence-salary.puml
plantuml -tpng diagrams/sequence-branch-update.puml
plantuml -tpng diagrams/sequence-ai-menu.puml
plantuml -tpng diagrams/sequence-offline-sync.puml
plantuml -tpng diagrams/ui-navigation.puml
```

> Not: VS Code için “PlantUML” eklentisi ile önizleme yapılabilir.