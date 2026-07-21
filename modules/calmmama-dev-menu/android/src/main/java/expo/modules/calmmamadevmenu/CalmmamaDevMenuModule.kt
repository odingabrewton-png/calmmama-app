package expo.modules.calmmamadevmenu

import android.app.Application
import expo.modules.devmenu.DevMenuDefaultPreferences
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class CalmmamaDevMenuModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CalmmamaDevMenu")

    Function("isToolsFabControlAvailable") {
      appContext.reactContext?.applicationContext is Application
    }

    AsyncFunction("setToolsFabVisible") { visible: Boolean ->
      val application = appContext.reactContext?.applicationContext as? Application
        ?: return@AsyncFunction false
      val prefs = DevMenuDefaultPreferences(application)
      prefs.showFab = visible
      true
    }
  }
}
