package expo.modules.alarmring

import android.content.Context
import org.json.JSONArray
import org.json.JSONException

data class WidgetPreset(val id: String, val label: String, val minutes: Int)

// The app's presets live in JavaScript storage, so the widgets read this native copy instead.
class PresetStore(context: Context) {
  private val prefs = context.getSharedPreferences(FILE_NAME, Context.MODE_PRIVATE)

  fun savePresets(json: String) {
    prefs.edit().putString(KEY_PRESETS, json).apply()
  }

  // A widget starts a timer with one tap, so only presets with a default time qualify.
  fun quickPresets(): List<WidgetPreset> {
    val json = prefs.getString(KEY_PRESETS, null) ?: return emptyList()
    return try {
      val array = JSONArray(json)
      (0 until array.length())
        .map { array.getJSONObject(it) }
        .map { WidgetPreset(it.getString("id"), it.getString("label"), it.optInt("defaultMinutes", 0)) }
        .filter { it.minutes > 0 }
    } catch (error: JSONException) {
      emptyList()
    }
  }

  fun findPreset(id: String): WidgetPreset? = quickPresets().firstOrNull { it.id == id }

  fun presetFor(widgetId: Int): WidgetPreset? =
    prefs.getString(widgetKey(widgetId), null)?.let(::findPreset)

  fun bindWidget(widgetId: Int, presetId: String) {
    prefs.edit().putString(widgetKey(widgetId), presetId).apply()
  }

  fun unbindWidget(widgetId: Int) {
    prefs.edit().remove(widgetKey(widgetId)).remove(lastStartKey(widgetId)).apply()
  }

  fun lastStartAt(widgetId: Int): Long = prefs.getLong(lastStartKey(widgetId), 0L)

  fun recordStart(widgetId: Int, at: Long) {
    prefs.edit().putLong(lastStartKey(widgetId), at).apply()
  }

  private fun widgetKey(widgetId: Int) = "widget_$widgetId"

  private fun lastStartKey(widgetId: Int) = "last_start_$widgetId"

  private companion object {
    const val FILE_NAME = "alarmring_widgets"
    const val KEY_PRESETS = "presets"
  }
}
