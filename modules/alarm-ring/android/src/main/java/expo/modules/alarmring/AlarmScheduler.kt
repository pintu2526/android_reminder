package expo.modules.alarmring

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.net.toUri

class AlarmScheduler(private val context: Context) {
  private val alarmManager = context.getSystemService(AlarmManager::class.java)

  fun canScheduleExactAlarms(): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager.canScheduleExactAlarms()

  fun schedule(id: String, label: String, triggerAtMillis: Long) {
    check(canScheduleExactAlarms()) {
      "Exact alarms are not allowed. Enable \"Alarms & reminders\" for this app in Settings."
    }
    val alarmClock = AlarmManager.AlarmClockInfo(triggerAtMillis, openAppIntent())
    alarmManager.setAlarmClock(alarmClock, checkNotNull(fireIntent(id, label, PendingIntent.FLAG_UPDATE_CURRENT)))
  }

  fun cancel(id: String) {
    // NO_CREATE: only look up an existing alarm, never create one just to cancel it.
    val pending = fireIntent(id, label = "", PendingIntent.FLAG_NO_CREATE) ?: return
    alarmManager.cancel(pending)
    pending.cancel()
  }

  // PendingIntents are matched on action/data, not extras, so the id goes in the data
  // to make each alarm's PendingIntent unique and cancellable.
  private fun fireIntent(id: String, label: String, flags: Int): PendingIntent? {
    val intent = Intent(context, AlarmReceiver::class.java)
      .setData("alarmring://alarm/$id".toUri())
      .putExtra(AlarmReceiver.EXTRA_LABEL, label)
    return PendingIntent.getBroadcast(
      context, 0, intent, PendingIntent.FLAG_IMMUTABLE or flags
    )
  }

  private fun openAppIntent(): PendingIntent {
    val intent = checkNotNull(context.packageManager.getLaunchIntentForPackage(context.packageName)) {
      "This app has no launch intent."
    }
    return PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
  }
}
