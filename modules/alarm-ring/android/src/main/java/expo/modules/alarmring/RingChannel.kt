package expo.modules.alarmring

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context

object RingChannel {
  const val ID = "ringing_timers"

  // Created when the module loads, not only when ringing, because Android 13+ shows
  // the notification permission prompt only for apps that already have a channel.
  fun ensureCreated(context: Context) {
    val channel = NotificationChannel(ID, "Ringing timers", NotificationManager.IMPORTANCE_HIGH)
      // The service plays the sound itself, so the channel stays silent.
      .apply { setSound(null, null) }
    context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
  }
}
