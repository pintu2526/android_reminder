package expo.modules.alarmring

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val label = intent.getStringExtra(EXTRA_LABEL).orEmpty()
    val ringIntent = Intent(context, RingService::class.java)
      .putExtra(RingService.EXTRA_LABEL, label)
    context.startForegroundService(ringIntent)
  }

  companion object {
    const val EXTRA_LABEL = "label"
  }
}
