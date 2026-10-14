package expo.modules.alarmring

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat

class RingActivity : Activity() {
  private val ringingStopped = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) = finish()
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(buildLayout(intent.getStringExtra(RingService.EXTRA_LABEL).orEmpty()))
    ContextCompat.registerReceiver(
      this,
      ringingStopped,
      IntentFilter(RingService.ACTION_RINGING_STOPPED),
      ContextCompat.RECEIVER_NOT_EXPORTED
    )
  }

  override fun onDestroy() {
    unregisterReceiver(ringingStopped)
    super.onDestroy()
  }

  private fun buildLayout(label: String) = LinearLayout(this).apply {
    orientation = LinearLayout.VERTICAL
    gravity = Gravity.CENTER
    keepScreenOn = true
    addView(TextView(context).apply {
      text = label
      textSize = 32f
      gravity = Gravity.CENTER
    })
    addView(TextView(context).apply {
      text = "Time's up!"
      textSize = 20f
      gravity = Gravity.CENTER
    })
    addView(Button(context).apply {
      text = "Stop"
      textSize = 24f
      setOnClickListener { stopRinging() }
    })
  }

  private fun stopRinging() {
    startService(Intent(this, RingService::class.java).setAction(RingService.ACTION_STOP))
    finish()
  }
}
