package expo.modules.alarmring

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.content.res.Configuration
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast

// Shown when the user adds a widget: pick which preset this widget starts.
class WidgetConfigActivity : Activity() {
  private var widgetId = AppWidgetManager.INVALID_APPWIDGET_ID

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    widgetId = intent.getIntExtra(
      AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID
    )
    // If the user backs out, Android must not add an unconfigured widget.
    setResult(RESULT_CANCELED, resultIntent())

    val presets = PresetStore(this).quickPresets()
    if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID || presets.isEmpty()) {
      Toast.makeText(this, R.string.alarmring_widget_no_presets, Toast.LENGTH_LONG).show()
      finish()
      return
    }
    setContentView(buildLayout(presets))
  }

  private fun resultIntent() = Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)

  private fun choose(preset: WidgetPreset) {
    PresetStore(this).bindWidget(widgetId, preset.id)
    QuickTimerWidget.update(this, AppWidgetManager.getInstance(this), widgetId)
    setResult(RESULT_OK, resultIntent())
    finish()
  }

  private fun buildLayout(presets: List<WidgetPreset>): ScrollView {
    val night = resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK ==
      Configuration.UI_MODE_NIGHT_YES
    val screenColor = if (night) 0xFF0F1220.toInt() else 0xFFF4F6FB.toInt()
    val textColor = if (night) 0xFFEEF0FF.toInt() else 0xFF14172B.toInt()
    val buttonColor = if (night) 0xFFAEB9FF.toInt() else 0xFF3949AB.toInt()
    val buttonText = if (night) 0xFF10163F.toInt() else 0xFFFFFFFF.toInt()
    val density = resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()

    val list = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(24), dp(24), dp(24), dp(24))
      fitsSystemWindows = true
      addView(TextView(context).apply {
        text = getString(R.string.alarmring_widget_pick_preset)
        textSize = 24f
        typeface = Typeface.DEFAULT_BOLD
        setTextColor(textColor)
        setPadding(0, 0, 0, dp(16))
      })
      presets.forEach { preset ->
        addView(
          Button(context).apply {
            text = "${preset.label}  ·  ${preset.minutes} min"
            textSize = 20f
            isAllCaps = false
            gravity = Gravity.CENTER_VERTICAL or Gravity.START
            setTextColor(buttonText)
            stateListAnimator = null
            background = GradientDrawable().apply {
              setColor(buttonColor)
              cornerRadius = dp(20).toFloat()
            }
            setPadding(dp(20), 0, dp(20), 0)
            setOnClickListener { choose(preset) }
          },
          LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(64)).apply {
            bottomMargin = dp(12)
          }
        )
      }
    }
    return ScrollView(this).apply {
      setBackgroundColor(screenColor)
      addView(list)
    }
  }
}
