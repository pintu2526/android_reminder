package expo.modules.alarmring

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.Configuration
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat

class RingActivity : Activity() {
  private val ringingStopped = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) = finish()
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(buildLayout(intent.getStringExtra(RingService.EXTRA_LABEL).orEmpty()))
    // Dark status-bar icons on the light screen, light ones on the dark screen.
    WindowCompat.getInsetsController(window, window.decorView).isAppearanceLightStatusBars =
      !isNight()
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

  private fun isNight() =
    resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK ==
      Configuration.UI_MODE_NIGHT_YES

  // Large message text and a round power-style Stop button: this is the screen shown when the alarm rings.
  private fun buildLayout(label: String): LinearLayout {
    val night = isNight()
    val screenColor = if (night) 0xFF0F1220.toInt() else 0xFFF4F6FB.toInt()
    val textColor = if (night) 0xFFEEF0FF.toInt() else 0xFF14172B.toInt()
    val stopBackground = if (night) 0xFFFFB4AB.toInt() else 0xFFB3261E.toInt()
    val stopIcon = if (night) 0xFF3B0A08.toInt() else 0xFFFFFFFF.toInt()
    val density = resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()

    val messages = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      addView(TextView(context).apply {
        text = label
        textSize = 44f
        typeface = Typeface.DEFAULT_BOLD
        setTextColor(textColor)
        gravity = Gravity.CENTER
      })
      addView(TextView(context).apply {
        text = "Time's up!"
        textSize = 28f
        setTextColor(textColor)
        gravity = Gravity.CENTER
      })
    }
    val powerButton = FrameLayout(this).apply {
      contentDescription = "Stop the alarm"
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(stopBackground)
      }
      addView(
        PowerIconView(context, stopIcon),
        FrameLayout.LayoutParams(dp(56), dp(56), Gravity.CENTER)
      )
    }
    val stopLabel = TextView(this).apply {
      text = "STOP"
      textSize = 20f
      typeface = Typeface.DEFAULT_BOLD
      setTextColor(textColor)
      gravity = Gravity.CENTER
    }
    val stopButton = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      addView(powerButton, LinearLayout.LayoutParams(dp(120), dp(120)))
      addView(stopLabel, LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.WRAP_CONTENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      ).apply { topMargin = dp(12) })
      setOnClickListener { stopRinging() }
    }

    return LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setBackgroundColor(screenColor)
      keepScreenOn = true
      fitsSystemWindows = true
      addView(
        messages,
        LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f).apply {
          setMargins(dp(24), dp(24), dp(24), dp(16))
        }
      )
      addView(
        stopButton,
        LinearLayout.LayoutParams(
          LinearLayout.LayoutParams.WRAP_CONTENT,
          LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply {
          gravity = Gravity.CENTER_HORIZONTAL
          setMargins(dp(24), dp(16), dp(24), dp(48))
        }
      )
    }
  }

  private fun stopRinging() {
    startService(Intent(this, RingService::class.java).setAction(RingService.ACTION_STOP))
    finish()
  }
}

// Drawn with a Canvas because the power symbol is missing from many phone fonts.
private class PowerIconView(context: Context, color: Int) : View(context) {
  private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    this.color = color
    style = Paint.Style.STROKE
    strokeCap = Paint.Cap.ROUND
  }

  override fun onDraw(canvas: Canvas) {
    val stroke = width / 8f
    paint.strokeWidth = stroke
    val inset = stroke / 2
    val ring = RectF(inset, inset, width - inset, height - inset)
    // A circle open at the top, with a vertical bar through the gap.
    canvas.drawArc(ring, -60f, 300f, false, paint)
    canvas.drawLine(width / 2f, inset, width / 2f, height / 2f, paint)
  }
}
