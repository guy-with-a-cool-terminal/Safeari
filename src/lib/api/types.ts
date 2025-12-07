// Centralized type definitions for the entire application
// Explicit re-exports to avoid naming conflicts

export type { 
    LoginRequest, 
    LoginResponse, 
    RegisterRequest, 
    RegisterResponse,
    RefreshRequest,
    RefreshResponse 
} from './auth';

export type { 
    Profile, 
    CreateProfileRequest, 
    UpdateProfileRequest,
    AgePreset 
} from './profiles';

export type { 
    ParentalControlsData,
    UpdateParentalControlsRequest,
    RecreationScheduleData,
    UpdateRecreationScheduleRequest,
    SecuritySettingsData,
    UpdateSecuritySettingsRequest,
    PrivacySettingsData,
    UpdatePrivacySettingsRequest,
    Blocklist as SettingsBlocklist,
    NativeTracker as SettingsNativeTracker
} from './settings';

export type { 
    DomainEntry,
    DomainListResponse,
    UpdateDomainsRequest 
} from './lists';

export type { 
    QueryStat,
    DeviceStat,
    OverviewResponse,
    DomainStat,
    TimelineData,
    TrackerStat,
    TrackersResponse,
    BlockingReason,
    LogDevice,
    LogEntry,
    LogsResponse,
    ExportLogsResponse
} from './analytics';

export type { 
    NextDNSSetup,
    NextDNSDetails,
    SecurityFeature,
    ParentalService,
    ContentCategory,
    Blocklist as UtilsBlocklist,
    NativeTracker as UtilsNativeTracker,
    ServiceConfig,
    CategoryConfig,
    AgePresetSecurity,
    AgePresetParentalControl,
    AgePresetPrivacy,
    AgePresetConfig,
    CountryTLD,
    ReferenceDataMeta,
    ReferenceDataResponse
} from './utils';

export type { 
    SubscriptionTier,
    Subscription,
    CreateSubscriptionRequest,
    CreateSubscriptionResponse,
    UsageSummary,
    Invoice,
    PaymentHistory
} from './subscriptions';