package expo.modules.alarmring

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.core.app.NotificationManagerCompat
import java.util.UUID

class WidgetTapReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val widgetId = intent.getIntExtra(
      AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID
    )
    val store = PresetStore(context)
    val preset = store.presetFor(widgetId)
    when {
      preset == null -> toast(context, context.getString(R.string.alarmring_widget_removed))
      // Stop lives in the ring notification, so without it a ringing alarm cannot be stopped.
      !NotificationManagerCompat.from(context).areNotificationsEnabled() ->
        toast(context, context.getString(R.string.alarmring_widget_notifications_off))
      // A second tap right after the first is almost always a mistake, and would start a second timer.
      System.currentTimeMillis() - store.lastStartAt(widgetId) < DUPLICATE_TAP_WINDOW_MS ->
        toast(context, context.getString(R.string.alarmring_widget_already_started, preset.label))
      else -> startTimer(context, store, widgetId, preset)
    }
  }

  private fun startTimer(context: Context, store: PresetStore, widgetId: Int, preset: WidgetPreset) {
    val now = System.currentTimeMillis()
    val ringAt = now + preset.minutes * 60_000L
    try {
      val id = UUID.randomUUID().toString()
      AlarmScheduler(context).schedule(id, preset.label, ringAt)
      WidgetTimerStore(context).add(id, preset.label, ringAt)
      // Only a successful start begins the window, so a failed tap can be retried at once.
      store.recordStart(widgetId, now)
      toast(context, "${preset.label}: ${preset.minutes} min")
    } catch (error: IllegalStateException) {
      toast(context, error.message.orEmpty())
    }
  }

  private companion object {
    const val DUPLICATE_TAP_WINDOW_MS = 10_000L
  }

  private fun toast(context: Context, message: String) {
    Toast.makeText(context, message, Toast.LENGTH_LONG).show()
  }
}
