function anovaRes = anova_analysis(y, groups)
% ANOVA_ANALYSIS Computes One-Way ANOVA across categorical groups (e.g. observation hours)
% Tests H0: mu_1 = mu_2 = ... = mu_k vs H1: at least one mean differs
% Built with base MATLAB standard equations and F-distribution CDF approximation.

    [uGroups, ~, groupIdx] = unique(groups);
    k = length(uGroups);      % Number of groups
    N = length(y);            % Total observations

    if k < 2
        error('At least 2 distinct groups are required for ANOVA.');
    end

    grandMean = mean(y);
    groupMeans = zeros(k, 1);
    groupSizes = zeros(k, 1);
    SS_between = 0;
    SS_within = 0;

    for i = 1:k
        groupData = y(groupIdx == i);
        n_i = length(groupData);
        m_i = mean(groupData);

        groupSizes(i) = n_i;
        groupMeans(i) = m_i;

        SS_between = SS_between + n_i * (m_i - grandMean)^2;
        SS_within  = SS_within  + sum((groupData - m_i).^2);
    end

    df_between = k - 1;
    df_within  = N - k;

    MS_between = SS_between / df_between;
    MS_within  = SS_within / df_within;

    if MS_within > 0
        F_stat = MS_between / MS_within;
    else
        F_stat = Inf;
    end

    % P-value computation via betainc (base MATLAB regularized incomplete beta function)
    % For F(df1, df2), x = (df1*F)/(df1*F + df2), p = 1 - betainc(x, df1/2, df2/2)
    if isfinite(F_stat) && F_stat >= 0
        x = (df_between * F_stat) / (df_between * F_stat + df_within);
        p_val = 1 - betainc(x, df_between / 2, df_within / 2);
    else
        p_val = 0;
    end

    alpha = 0.05;
    rejectH0 = (p_val < alpha);

    anovaRes.groups = uGroups;
    anovaRes.groupMeans = groupMeans;
    anovaRes.groupSizes = groupSizes;
    anovaRes.SS_between = SS_between;
    anovaRes.SS_within = SS_within;
    anovaRes.df_between = df_between;
    anovaRes.df_within = df_within;
    anovaRes.MS_between = MS_between;
    anovaRes.MS_within = MS_within;
    anovaRes.F_stat = F_stat;
    anovaRes.p_val = p_val;
    anovaRes.rejectH0 = rejectH0;

    fprintf('--- MODULE II: ONE-WAY ANOVA ---\n');
    fprintf('H0: Mean network load is equal across all observation hours\n');
    fprintf('H1: At least one observation hour has a significantly different mean load\n');
    fprintf('Between Groups: SS = %.4f | df = %d | MS = %.4f\n', SS_between, df_between, MS_between);
    fprintf('Within Groups:  SS = %.4f | df = %d | MS = %.4f\n', SS_within, df_within, MS_within);
    fprintf('F-statistic:    %.4f\n', F_stat);
    fprintf('P-value:        %.6f\n', p_val);
    if rejectH0
        fprintf('Decision: Reject H0 at alpha=%.2f (Statistically significant difference across hours)\n\n', alpha);
    else
        fprintf('Decision: Fail to reject H0 at alpha=%.2f (Insufficient evidence of load differences)\n\n', alpha);
    end
end
