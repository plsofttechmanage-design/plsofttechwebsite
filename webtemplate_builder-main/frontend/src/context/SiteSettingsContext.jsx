import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../api/settings';

const DEFAULT_SETTINGS = {
  company_name: 'Craftr',
  company_tagline: 'WordPress & Modern Templates',
  logo_text: 'Studio',
  logo_url: '',
  logo_icon: 'layers',
  contact_email: 'support@craftr.studio',
  hero_badge: 'WordPress-Inspired Template Marketplace & Live Studio',
  hero_title: 'Discover, Customize & Launch',
  hero_title_highlight: 'High-Converting Templates',
  hero_subtitle:
    'Browse our curated catalogue of responsive website templates. Tune color palettes, typography, and content in our live browser studio before downloading clean, verified packages.',
  cta_primary_text: 'Explore Catalogue',
  cta_secondary_text: 'Open Live Theme Studio',
  metric_1_value: '500+',
  metric_1_label: 'Production Components',
  metric_2_value: '100%',
  metric_2_label: 'Clean Verified Code',
  metric_3_value: 'Real-Time',
  metric_3_label: 'Theme Studio Editor',
  metric_4_value: '4.9 / 5.0',
  metric_4_label: 'Customer Rating Score',
  promo_banner_active: true,
  promo_banner_title: 'Get 20% Off Any Template Today',
  promo_banner_text:
    'Apply promo code at checkout to unlock immediate savings across our entire catalogue.',
  promo_coupon_code: 'WELCOME20',
  footer_description:
    'The premier digital template marketplace inspired by WordPress. Discover curated themes, tweak settings in our live visual theme studio, and download production packages with verified licenses.',
  footer_copyright: '© 2026 Craftr Studio & Marketplace. All rights reserved.',
};

const SiteSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await settingsAPI.getSiteSettings();
      if (data && typeof data === 'object') {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.warn('Using default site settings. Failed to fetch from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    const updated = await settingsAPI.updateSiteSettings(newSettings);
    setSettings((prev) => ({ ...prev, ...updated }));
    return updated;
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);

