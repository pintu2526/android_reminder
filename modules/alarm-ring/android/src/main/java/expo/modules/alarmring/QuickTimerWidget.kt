package expo.modules.alarmring

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import androidx.core.net.toUri

// A home-screen button that starts one preset's timer without opening the app.
class QuickTimerWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, appWidgetIds: IntArray) {
    appWidgetIds.forEach { update(context, manager, it) }
  }

  override fun onDeleted(context: Context, appWidgetIds: IntArray) {
    val store = PresetStore(context)
    appWidgetIds.forEach(store::unbindWidget)
  }

  companion object {
    fun updateAll(context: Context) {
      val manager = AppWidgetManager.getInstance(context)
      manager.getAppWidgetIds(ComponentName(context, QuickTimerWidget::class.java))
        .forEach { update(context, manager, it) }
    }

    fun update(context: Context, manager: AppWidgetManager, widgetId: Int) {
      val preset = PresetStore(context).presetFor(widgetId)
      val views = RemoteViews(context.packageName, R.layout.widget_quick_timer)
      if (preset == null) {
        views.setTextViewText(R.id.widget_label, context.getString(R.string.alarmring_widget_removed))
        views.setTextViewText(R.id.widget_minutes, "")
      } else {
        views.setTextViewText(R.id.widget_label, preset.label)
        views.setTextViewText(R.id.widget_minutes, "${preset.minutes} min")
        views.setOnClickPendingIntent(R.id.widget_root, tapIntent(context, widgetId))
      }
      manager.updateAppWidget(widgetId, views)
    }

    // PendingIntents are matched on action/data, not extras, so the widget id goes in the data
    // to give each widget its own PendingIntent.
    private fun tapIntent(context: Context, widgetId: Int): PendingIntent {
      val intent = Intent(context, WidgetTapReceiver::class.java)
        .setData("alarmring://widget/$widgetId".toUri())
        .putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
      return PendingIntent.getBroadcast(
        context, 0, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
      )
    }
  }
}
