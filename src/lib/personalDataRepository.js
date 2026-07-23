import { supabase } from './supabase';

export async function loadPersonalData(userId) {
  return supabase.from('personal_data').select('payload').eq('user_id', userId).maybeSingle();
}

export async function savePersonalData(userId, data) {
  const documentResult = await supabase.from('personal_data').upsert({ user_id: userId, payload: data, updated_at: new Date().toISOString() });
  if (documentResult.error) return documentResult;
  const domainError = await mirrorDomainTables(userId, data);
  return { data: documentResult.data, error: domainError };
}

export async function saveUserProfile(user, data) {
  if (!user?.id) return { error: new Error('A signed-in user is required.') };
  return supabase.from('profiles').upsert({
    id: user.id,
    email: user.email || null,
    display_name: data.settings?.name || user.user_metadata?.full_name || '',
    timezone: data.automations?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    updated_at: new Date().toISOString(),
  });
}

async function mirrorDomainTables(userId, data) {
  const sports = data.sports || {};
  const work = data.workCareer || {};
  const athleteProfile = sports.profile || {};
  const workProfile = work.profile || {};
  const profileWrites = await Promise.all([
    supabase.from('athlete_profiles').upsert({
      user_id: userId,
      primary_sport: athleteProfile.primarySport || 'General fitness',
      experience_level: athleteProfile.level || 'recreational',
      weekly_training_target: Number(athleteProfile.weeklyTarget || 4),
      height_cm: Number(athleteProfile.heightCm) || null,
      weight_kg: Number(athleteProfile.weightKg) || null,
      goals: String(athleteProfile.goals || '').split(',').map((goal) => goal.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    }),
    supabase.from('work_profiles').upsert({
      user_id: userId,
      employer: workProfile.employer || '',
      role_title: workProfile.role || '',
      weekly_hours_target: Number(workProfile.weeklyHoursTarget || 0),
      career_goal: workProfile.careerGoal || '',
      updated_at: new Date().toISOString(),
    }),
  ]);
  const profileError = profileWrites.find((result) => result.error)?.error;
  if (profileError) return profileError;

  const collections = [
    ['training_sessions', (sports.sessions || []).map((item) => ({ user_id: userId, session_date: item.date, sport: item.sport, session_type: item.type, duration_minutes: Number(item.duration), intensity: Number(item.intensity), distance_km: Number(item.distanceKm) || 0, calories_burned: Number(item.calories) || 0, status: item.status, notes: item.notes || '' }))],
    ['nutrition_logs', (sports.nutrition || []).map((item) => ({ user_id: userId, log_date: item.date, meal_type: item.mealType, food_name: item.food, calories: Number(item.calories) || 0, protein_g: Number(item.protein) || 0, carbs_g: Number(item.carbs) || 0, fat_g: Number(item.fat) || 0, water_ml: Number(item.waterMl) || 0, notes: item.notes || '' }))],
    ['athlete_metrics', (sports.metrics || []).map((item) => ({ user_id: userId, recorded_at: `${item.date}T12:00:00.000Z`, metric_type: item.metric, value: Number(item.value), unit: item.unit, source: item.source || 'manual', notes: item.notes || '' }))],
    ['work_shifts', (work.shifts || []).map((item) => ({ user_id: userId, shift_date: item.date, start_time: item.start, end_time: item.end, break_minutes: Number(item.breakMinutes) || 0, shift_type: item.type, employer: item.employer || '', role_title: item.role || '', status: item.status, notes: item.notes || '' }))],
    ['career_development', (work.development || []).map((item) => ({ user_id: userId, item_type: item.type, title: item.title, provider: item.provider || '', field_of_study: item.field || '', status: item.status, start_date: item.startDate || null, target_date: item.targetDate || null, progress: Number(item.progress) || 0, weekly_hours_target: Number(item.weeklyHoursTarget) || 0, notes: item.notes || '' }))],
    ['career_opportunities', (work.opportunities || []).map((item) => ({ user_id: userId, organization: item.organization, role_title: item.role, opportunity_type: item.type, status: item.status, applied_date: item.date || null, next_action: item.nextAction || '', notes: item.notes || '' }))],
  ];
  for (const [table, rows] of collections) {
    const { error: deleteError } = await supabase.from(table).delete().eq('user_id', userId);
    if (deleteError) return deleteError;
    if (rows.length) {
      const { error: insertError } = await supabase.from(table).insert(rows);
      if (insertError) return insertError;
    }
  }
  return null;
}
