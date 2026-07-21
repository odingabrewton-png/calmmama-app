import ExpoModulesCore

#if canImport(EXDevMenu)
import EXDevMenu
#endif

public class CalmmamaDevMenuModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CalmmamaDevMenu")

    Function("isToolsFabControlAvailable") { () -> Bool in
      #if canImport(EXDevMenu) && !os(macOS) && !os(tvOS)
      return true
      #else
      return false
      #endif
    }

    AsyncFunction("setToolsFabVisible") { (visible: Bool) -> Bool in
      #if canImport(EXDevMenu) && !os(macOS) && !os(tvOS)
      DevMenuManager.shared.setShowFloatingActionButton(visible)
      return true
      #else
      return false
      #endif
    }
  }
}
