# Unitary Care Mobile App

Flutter MVP client for the buyer mobile experience defined in [docs/spec-lock.md](/Users/dikshantjain/Documents/Unitary%20Care/docs/spec-lock.md).

## Project Structure

```text
mobile_app/
  lib/
    app/
      app.dart
      router.dart
    core/
      config/
      models/
      network/
      storage/
      utils/
    features/
      auth/
      dashboard/
      documents/
      payments/
      progress/
      support/
```

## Navigation Flow

1. Login screen requests OTP with `POST /api/v1/auth/request-otp`.
2. OTP verification calls `POST /api/v1/auth/verify-otp`.
3. Successful login stores access and refresh tokens securely.
4. Authenticated users land on the dashboard.
5. Bottom navigation moves between Dashboard, Payments, Documents, Progress, and Support.
6. Support opens a detail screen for ticket status and resolution notes.

## API Integration Notes

- Base URL is configured in `lib/core/config/app_config.dart`.
- All API responses are parsed through the common envelope from the locked spec.
- `ApiClient` attaches bearer tokens automatically and attempts `POST /api/v1/auth/refresh` once on `401`.
- Secure token storage uses `flutter_secure_storage`.
- Paginated list endpoints are mapped to typed `PaginatedResponse<T>` models.

## How To Run

Flutter SDK is not available in this workspace, so platform folders were not generated here. Once Flutter is installed:

1. `cd mobile_app`
2. `flutter create .`
3. `flutter pub get`
4. Update the API base URL in `lib/core/config/app_config.dart`
5. `flutter run`
