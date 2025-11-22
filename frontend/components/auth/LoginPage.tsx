'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Heart, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { toast } from '@/components/common/Toast'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  // デバッグ用: パスワードの値を監視
  const passwordValue = watch('password')
  
  // パスワード入力の直接制御
  const passwordRegister = register('password', {
    required: 'パスワードは必須です',
    minLength: {
      value: 6,
      message: 'パスワードは6文字以上で入力してください',
    },
  })
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    passwordRegister.onChange(e) // react-hook-formのonChangeを呼び出す
    setValue('password', value, { shouldValidate: true, shouldDirty: true })
    console.log('Password changed:', value.length, 'characters')
  }

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    setLoading(true)

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login'
      console.log('Attempting to login/register:', endpoint, {
        email: data.email,
        passwordLength: data.password?.length || 0,
        isRegistering,
      })
      
      // パスワードが空でないことを確認
      if (!data.password || data.password.length < 6) {
        throw new Error('パスワードは6文字以上で入力してください')
      }
      
      const requestData = {
        email: data.email,
        password: data.password,
        ...(isRegistering && {
          name: data.email.split('@')[0],
          role: 'patient',
          language: 'ja',
        }),
      }
      
      console.log('Sending request data:', { ...requestData, password: '***' })
      
      const response = await api.post(endpoint, requestData)

      console.log('Response received:', response.data)
      
      if (response.data.access_token && response.data.user) {
        // トークンとユーザー情報を設定（トークンを先に設定）
        const token = response.data.access_token
        console.log('Setting token and user', {
          tokenLength: token?.length,
          tokenPrefix: token?.substring(0, 20),
          userId: response.data.user.id,
        })
        
        setToken(token)
        // トークンが確実に保存されたことを確認
        const savedToken = localStorage.getItem('access_token')
        if (savedToken !== token) {
          console.warn('Token mismatch after setting, retrying...')
          localStorage.setItem('access_token', token)
        }
        
        setUser(response.data.user)
        
        // 最終確認
        const finalToken = localStorage.getItem('access_token')
        console.log('Token and user set', {
          tokenInLocalStorage: !!finalToken,
          tokenMatches: finalToken === token,
          userSet: !!response.data.user,
        })
        
        console.log('Token and user set, redirecting...')
        toast.success(isRegistering ? '登録に成功しました' : 'ログインに成功しました')
        
        // リダイレクト（少し待ってから）
        setTimeout(() => {
          console.log('Navigating to dashboard')
          router.push('/dashboard')
          router.refresh() // ページをリフレッシュ
        }, 200)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
      
      let errorMessage = isRegistering ? '新規登録に失敗しました' : 'ログインに失敗しました'
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      } else if (err.response?.status === 400) {
        errorMessage = '入力内容に誤りがあります。メールアドレスとパスワード（6文字以上）を確認してください'
      } else if (err.response?.status === 401) {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません'
      } else if (err.response?.status === 500) {
        const serverError = err.response?.data?.error || 'サーバーエラー'
        errorMessage = `サーバーエラー: ${serverError}`
        console.error('Server error details:', serverError)
      } else if (!err.response) {
        errorMessage = 'ネットワークエラーが発生しました。接続を確認してください'
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ポケさぽ</h1>
            <p className="text-gray-600">患者と医療従事者のコミュニケーションプラットフォーム</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                メールアドレス
              </label>
              <input
                {...register('email')}
                type="email"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  {...passwordRegister}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  disabled={loading}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                  placeholder={isRegistering ? '6文字以上で入力してください' : '••••••••'}
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 pointer-events-none"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowPassword((prev) => !prev)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors cursor-pointer bg-transparent border-0 p-0 pointer-events-auto"
                    aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
              {isRegistering && (
                <p className="mt-1 text-xs text-gray-500">パスワードは6文字以上で入力してください</p>
              )}
              {/* デバッグ用: 開発環境でのみ表示 */}
              {process.env.NODE_ENV === 'development' && passwordValue && (
                <p className="mt-1 text-xs text-gray-400">入力文字数: {passwordValue.length}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {isRegistering ? '新規登録' : 'ログイン'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering)
                reset()
                setError(null)
              }}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
            >
              {isRegistering
                ? '既にアカウントをお持ちですか？ログイン'
                : 'アカウントをお持ちでない方は新規登録'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

