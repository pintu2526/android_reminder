package expo.modules.alarmring

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.net.toUri

class AlarmPermissions(private val context: Context) {
  fun canUseFullScreenIntent(): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE ||
      context.getSystemService(NotificationManager::class.java).canUseFullScreenIntent()

  fun openExactAlarmSettings() = openSettings(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)

  fun openFullScreenIntentSettings() = openSettings(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT)

  private fun openSettings(action: String) {
    val intent = Intent(action, "package:${context.packageName}".toUri())
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
  }
}
