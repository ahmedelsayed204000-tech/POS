import Foundation
import HealthKit

struct PersonalOSHealthRecord: Codable {
    let date: String
    let source: String
    let steps: Double?
    let sleepMinutes: Double?
    let restingHeartRate: Double?
    let hrv: Double?
    let workoutMinutes: Double?
    let weightKg: Double?
}

final class HealthSyncService {
    private let store = HKHealthStore()
    private let endpoint: URL

    init(endpoint: URL) { self.endpoint = endpoint }

    func requestAuthorization(completion: @escaping (Error?) -> Void) {
        let readTypes: Set<HKObjectType> = [
            HKQuantityType(.stepCount), HKQuantityType(.restingHeartRate),
            HKQuantityType(.heartRateVariabilitySDNN), HKQuantityType(.bodyMass),
            HKQuantityType(.activeEnergyBurned), HKObjectType.workoutType(),
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!
        ]
        store.requestAuthorization(toShare: [], read: readTypes, completion: { _, error in completion(error) })
    }

    // Query each authorized type, aggregate it by local calendar day, then POST [PersonalOSHealthRecord]
    // to the HTTPS backend. Never embed API keys in this app; use the signed-in user's session token.
}
