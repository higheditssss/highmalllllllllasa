import { supabase } from './supabase';

export async function register(email: string, password: string, username: string) {
  const cleaned = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (cleaned.length < 3) return { success: false, error: 'Username-ul trebuie să aibă minim 3 caractere' };
  if (password.length < 6) return { success: false, error: 'Parola trebuie să aibă minim 6 caractere' };

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', cleaned)
    .single();

  if (existing) return { success: false, error: 'Username-ul este deja folosit' };

  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username: cleaned } } });
  if (error) return { success: false, error: error.message };

  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      username: cleaned,
    });
  }

  return { success: true };
}

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: 'Email sau parolă greșită' };
  return { success: true };
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

export async function uploadAvatar(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split('.').pop();
  const path = `${user.id}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (error) return null;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);

  return data.publicUrl;
}

export async function updateProfile(fields: { bio?: string }): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Nu ești autentificat' };

  const { error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function uploadBanner(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split('.').pop();
  const path = `${user.id}/banner.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (error) return null;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  await supabase.from('profiles').update({ banner_url: data.publicUrl }).eq('id', user.id);

  return data.publicUrl;
}
