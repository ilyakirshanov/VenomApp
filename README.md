# VenomApp - уязвимая версия
Вы находитесь в уязвимой версии приложения на ветке Vulnerable. Чтобы перейти на защищенную версию и посмотреть анализ, переключитесь на ветку `main`. Чтобы увидеть процесс исправления уязвимостей, переключитесь на ветку `fixes`

## Уязвимости:

- SQL-инъекция (login, profile)
- XSS (хранимая, DOM-based)
- Path Traversal
- IDOR
- SSRF
- XXE
- Небезопасная загрузка файлов
- Hardcoded secret

## Запуск:
docker compose up --build;  приложение доступно на localhost:5000



    Threat Modelling и отчёт по ГОСТ Р 56939-2024 доступны в ветке main в файле TM+GOST-practices.md.

    CI/CD пайплайн с SAST/DAST описан в .github/workflows/ci.yml.
