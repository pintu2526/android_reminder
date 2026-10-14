package expo.modules.alarmring

import android.content.Context
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

// Timers started from a widget while the app was closed. The app collects them the next time it opens.
class WidgetTimerStore(context: Context) {
  private val prefs = context.getSharedPreferences(FILE_NAME, Context.MODE_PRIVATE)

  fun add(id: String, label: String, ringAt: Long) {
    synchronized(lock) {
      val now = System.currentTimeMillis()
      val kept = read().filter { it.getLong("ringAt") > now }
      val timer = JSONObject().put("id", id).put("label", label).put("ringAt", ringAt)
      prefs.edit().putString(KEY_TIMERS, JSONArray(kept + timer).toString()).apply()
    }
  }

  // Returns the timers as a JSON array and forgets them, so each is imported once.
  fun takeAll(): String =
    synchronized(lock) {
      val timers = prefs.getString(KEY_TIMERS, null) ?: "[]"
      prefs.edit().remove(KEY_TIMERS).apply()
      timers
    }

  private fun read(): List<JSONObject> {
    val json = prefs.getString(KEY_TIMERS, null) ?: return emptyList()
    return try {
      val array = JSONArray(json)
      (0 until array.length()).map { array.getJSONObject(it) }
    } catch (error: JSONException) {
      emptyList()
    }
  }

  private companion object {
    const val FILE_NAME = "alarmring_widget_timers"
    const val KEY_TIMERS = "timers"
    val lock = Any()
  }
}
