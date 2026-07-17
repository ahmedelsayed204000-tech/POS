# PersonalOS Health Companion

This folder is the native iOS companion source for Apple Health and Apple Watch data.

Open the companion target in Xcode on macOS, enable the HealthKit capability, add the HealthKit usage descriptions to `Info.plist`, and configure a secure HTTPS API endpoint. The iOS app asks for read permission only for sleep, steps, workouts, resting heart rate, HRV, active energy, and weight. It uploads normalized daily records to the PersonalOS backend only after user consent.

Apple Health data must not be sent to advertising systems or used for medical diagnosis. The user can revoke individual HealthKit permissions at any time.
