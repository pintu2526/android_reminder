package expo.modules.alarmring

import android.content.Context
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID

class AlarmRingModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val scheduler get() = AlarmScheduler(context)
  private val permissions get() = AlarmPermissions(context)

  override fun definition() = ModuleDefinition {
    Name("AlarmRing")

    OnCreate {
      RingChannel.ensureCreated(context)
    }

    Function("scheduleAlarm") { label: String, triggerAtMillis: Long ->
      val id = UUID.randomUUID().toString()
      scheduler.schedule(id, label, triggerAtMillis)
      id
    }

    Function("syncPresets") { presetsJson: String ->
      PresetStore(context).savePresets(presetsJson)
      QuickTimerWidget.updateAll(context)
    }

    Function("takeWidgetTimers") {
      WidgetTimerStore(context).takeAll()
    }

    Function("cancelAlarm") { id: String ->
      scheduler.cancel(id)
    }

    Function("canScheduleExactAlarms") {
      scheduler.canScheduleExactAlarms()
    }

    Function("canUseFullScreenIntent") {
      permissions.canUseFullScreenIntent()
    }

    Function("openExactAlarmSettings") {
      permissions.openExactAlarmSettings()
    }

    Function("openFullScreenIntentSettings") {
      permissions.openFullScreenIntentSettings()
    }
  }
}
