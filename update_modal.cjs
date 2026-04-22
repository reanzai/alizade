const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /{authMode === 'login' \? 'Welcome Back' : 'Create Account'}[\s\S]*?Already have an account\? Sign In"}[\s\S]*?<\/button>\s*<\/div>\s*<\/motion.div>/m;

const newContent = `
                  {/* Tabs */}
                  {/* Use a flex container for tabs instead of separate buttons outside */}
                  <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] uppercase text-center mb-2">
                    {authMode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
                  </h3>
                  <p className="text-gray-500 text-sm italic text-center">
                    {authMode === 'login' ? 'Tekrar hoş geldiniz.' : 'Savaşlara katılmak için hemen kayıt olun.'}
                  </p>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (authMode === 'login') {
                      handleLogin(authForm.email, authForm.password);
                    } else {
                      handleRegister(authForm);
                    }
                    setIsLoginModalOpen(false);
                  }}
                  className="space-y-4"
                >
                  {authMode === 'register' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] ml-2">Ad</label>
                        <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="text"
                            required
                            value={authForm.firstName}
                            onChange={(e) => setAuthForm({ ...authForm, firstName: e.target.value })}
                            className="w-full bg-[#0A0D14] border border-[#252A36] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
                            placeholder="Adınız"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] ml-2">Soyad</label>
                        <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="text"
                            required
                            value={authForm.lastName}
                            onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })}
                            className="w-full bg-[#0A0D14] border border-[#252A36] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
                            placeholder="Soyadınız"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] ml-2">TikTok Kullanıcı Adı</label>
                      <div className="relative">
                        <Music size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="text"
                          required
                          value={authForm.tiktokUsername}
                          onChange={(e) => setAuthForm({ ...authForm, tiktokUsername: e.target.value })}
                          className="w-full bg-[#0A0D14] border border-[#252A36] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
                          placeholder="@kullaniciadi"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] ml-2">E-posta Adresi</label>
                    <div className="relative">
                      <Mic size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 opacity-0" />
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <input 
                        type="email"
                        required
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        className="w-full bg-[#0A0D14] border border-[#252A36] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] ml-2">Telefon Numarası</label>
                      <div className="flex gap-2">
                        <select 
                          value={authForm.phoneCountryCode}
                          onChange={(e) => setAuthForm({ ...authForm, phoneCountryCode: e.target.value })}
                          className="w-[110px] bg-[#0A0D14] border border-[#252A36] rounded-xl px-3 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm appearance-none"
                        >
                          <option value="TR +90">TR +90</option>
                          <option value="US +1">US +1</option>
                          <option value="DE +49">DE +49</option>
                        </select>
                        <div className="relative flex-1">
                          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <input 
                            type="tel"
                            required
                            value={authForm.phone}
                            onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                            className="w-full bg-[#0A0D14] border border-[#252A36] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
                            placeholder="501 234 56 78"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] ml-2">Şifre</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input 
                        type="password"
                        required
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        className="w-full bg-[#0A0D14] border border-[#252A36] rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm tracking-widest"
                        placeholder="••••••••"
                      />
                      <Eye className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 cursor-pointer hover:text-white" />
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] ml-2">Şifre Tekrar</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                          type="password"
                          required
                          value={authForm.passwordConfirm}
                          onChange={(e) => setAuthForm({ ...authForm, passwordConfirm: e.target.value })}
                          className="w-full bg-[#0A0D14] border border-[#252A36] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm tracking-widest"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] ml-2">Referans Kullanıcı Adı (İsteğe Bağlı)</label>
                      <div className="relative">
                        <UserPlus size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="text"
                          value={authForm.referredBy}
                          onChange={(e) => setAuthForm({ ...authForm, referredBy: e.target.value })}
                          className="w-full bg-[#0A0D14] border border-[#252A36] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
                          placeholder="@referanskullaniciadi"
                        />
                      </div>
                      <p className="text-[9px] text-gray-600 leading-tight mt-2 italic px-2">
                        * Kimin referansı ile geldiyseniz onun TikTok kullanıcı adını yazınız. (Örnek: @valibeyofficial)
                      </p>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-[#8B5CF6] text-white py-4 flex items-center justify-center gap-2 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#8B5CF6]/20 hover:bg-[#7C3AED] hover:scale-[1.02] active:scale-[0.98] transition-all mt-6"
                  >
                    {authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol Ve Başla'} <ArrowUpRight size={16} />
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#252A36] flex flex-col items-center">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Topluluk ve Mağaza</p>
                   <div className="flex gap-2">
                     <button className="w-10 h-10 bg-[#1A1F2C] border border-[#252A36] rounded-xl flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/10 transition-colors">
                       <MessageSquare size={18} />
                     </button>
                     <button className="w-10 h-10 bg-[#1A1F2C] border border-[#252A36] rounded-xl flex items-center justify-center text-[#5865F2] hover:bg-[#5865F2]/10 transition-colors">
                       <Users size={18} />
                     </button>
                     <button className="w-10 h-10 bg-[#1A1F2C] border border-[#252A36] rounded-xl flex items-center justify-center text-[#0088cc] hover:bg-[#0088cc]/10 transition-colors">
                       <Send size={18} />
                     </button>
                     <button className="w-10 h-10 bg-[#1A1F2C] border border-[#252A36] rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100/10 transition-colors">
                       <ShoppingCart size={18} />
                     </button>
                     <button className="w-10 h-10 bg-[#1A1F2C] border border-[#252A36] rounded-xl flex items-center justify-center text-[#FF0000] hover:bg-[#FF0000]/10 transition-colors">
                       <Youtube size={18} />
                     </button>
                     <button className="w-10 h-10 bg-[#1A1F2C] border border-[#252A36] rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                       <Music size={18} />
                     </button>
                   </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-500 font-bold">
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="hover:text-white transition-colors"
                  >
                    {authMode === 'login' ? "Hesabınız yok mu? Kayıt Olun" : "Zaten hesabınız var mı? Giriş Yapın"}
                  </button>
                </div>
              </motion.div>
`;

if(regex.test(content)) {
  content = content.replace(regex, newContent);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Success");
} else {
  console.log("Failed to match Regex");
}
