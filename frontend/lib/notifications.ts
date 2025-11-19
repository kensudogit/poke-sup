/**
 * Browser Notification API wrapper
 */

export class NotificationService {
  private static permission: NotificationPermission = 'default'

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted'
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    }

    return false
  }

  static async show(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      return
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        return
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }

  static async showReminder(title: string, body: string): Promise<void> {
    await this.show('リマインダー: ' + title, {
      body,
      tag: 'reminder',
      requireInteraction: true,
    })
  }

  static async showMessage(sender: string, content: string): Promise<void> {
    await this.show('新しいメッセージ', {
      body: `${sender}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      tag: 'message',
    })
  }
}

